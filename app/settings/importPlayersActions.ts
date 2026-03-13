'use server';

import { getSession, getEffectiveClubId } from '@/lib/auth';
import { parseCsv, parseXlsx } from '@/lib/import/parsers';
import prisma from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';
import type { FieldMapping, ParsedFile } from '@/lib/import/types';
import { buildPlayerImportPreview, type PlayerImportPreviewResult } from '@/lib/import/validation';

type ParseResult = {
  parsed: ParsedFile;
};

function ensureAdminSession() {
  return getSession().then((session) => {
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN')) {
      throw new Error('Unauthorized');
    }
    const clubId = getEffectiveClubId(session);
    if (!clubId) {
      throw new Error('Geen clubcontext gevonden voor import.');
    }
    return { session, clubId };
  });
}

export async function parseImportFile(formData: FormData): Promise<ParseResult> {
  await ensureAdminSession();

  const file = formData.get('file') as File | null;
  if (!file) {
    throw new Error('Geen bestand ontvangen.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const lowerName = file.name.toLowerCase();

  let parsed: ParsedFile;
  if (lowerName.endsWith('.csv')) {
    parsed = await parseCsv(buffer, file.name);
  } else if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
    parsed = await parseXlsx(buffer, file.name);
  } else {
    throw new Error('Bestandsformaat niet ondersteund. Gebruik CSV of Excel (.xlsx).');
  }

  return { parsed };
}

type PreviewResult = PlayerImportPreviewResult;

export async function preparePlayerImport(
  parsed: ParsedFile,
  mapping: FieldMapping
): Promise<PreviewResult> {
  const { clubId } = await ensureAdminSession();
  const result = await buildPlayerImportPreview(clubId, parsed, mapping);
  return result;
}

type ExecuteResult = {
  importedCount: number;
  skippedInvalidCount: number;
  skippedDuplicateCount: number;
};

export async function executePlayerImport(
  parsed: ParsedFile,
  mapping: FieldMapping,
  options: { importDuplicates?: boolean }
): Promise<ExecuteResult> {
  const { session, clubId } = await ensureAdminSession();
  const preview = await buildPlayerImportPreview(clubId, parsed, mapping);

  const validRows = preview.rows.filter((r) => r.draft && r.issues.errors.length === 0);

  const rowsToInsert = validRows.filter((r) => {
    if (!r.issues.isDuplicate && !r.issues.isDuplicateWithinFile) return true;
    return Boolean(options.importDuplicates);
  });

  if (!rowsToInsert.length) {
    return {
      importedCount: 0,
      skippedInvalidCount: preview.invalidCount,
      skippedDuplicateCount: preview.duplicateCount,
    };
  }

  await prisma.$transaction(
    rowsToInsert.map((r) =>
      prisma.player.create({
        data: {
          name: r.draft!.name,
          type: r.draft!.type ?? 'EXTERNAL',
          position: r.draft!.position,
          secondaryPosition: r.draft!.secondaryPosition,
          preferredFoot: r.draft!.preferredFoot,
          team: r.draft!.team,
          niveau: r.draft!.niveau,
          currentClub: r.draft!.currentClub,
          status: r.draft!.status,
          step: r.draft!.step,
          advies: r.draft!.advies,
          notes: r.draft!.notes,
          dateOfBirth: r.draft!.dateOfBirth ?? null,
          clubId,
          createdById: session.user.id,
        },
      })
    )
  );

  const importedCount = rowsToInsert.length;
  const skippedInvalidCount = preview.invalidCount;
  const skippedDuplicateCount = preview.duplicateCount - (options.importDuplicates ? preview.duplicateCount : 0);

  await logAuditEvent({
    session,
    action: 'PLAYER_IMPORTED',
    entityType: 'Player',
    entityId: null,
    metadata: {
      clubId,
      importedCount,
      skippedInvalidCount,
      skippedDuplicateCount,
    },
  });

  return {
    importedCount,
    skippedInvalidCount,
    skippedDuplicateCount,
  };
}

