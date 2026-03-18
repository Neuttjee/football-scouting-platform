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
  mapping: FieldMapping,
  options?: { importMode?: "INTERNAL" | "EXTERNAL" }
): Promise<PreviewResult> {
  const { clubId } = await ensureAdminSession();
  const importMode = options?.importMode ?? "EXTERNAL";
  const result = await buildPlayerImportPreview(clubId, parsed, mapping, { importMode });
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
  options: { importDuplicates?: boolean },
  extra?: { importMode?: "INTERNAL" | "EXTERNAL" }
): Promise<ExecuteResult> {
  const { session, clubId } = await ensureAdminSession();
  const importMode = extra?.importMode ?? "EXTERNAL";
  const preview = await buildPlayerImportPreview(clubId, parsed, mapping, { importMode });

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

  const teams = await (prisma as any).team.findMany({
    where: { clubId, isActive: true },
    select: { id: true, name: true, code: true, niveau: true },
  });
  const teamByLabel = new Map<string, { id: string; label: string; niveau?: string | null }>();
  for (const t of teams as any[]) {
    const label = (t.code || t.name || "").trim();
    if (label) teamByLabel.set(label.toLowerCase(), { id: t.id, label, niveau: t.niveau ?? null });
    if (t.name) teamByLabel.set(String(t.name).trim().toLowerCase(), { id: t.id, label, niveau: t.niveau ?? null });
    if (t.code) teamByLabel.set(String(t.code).trim().toLowerCase(), { id: t.id, label, niveau: t.niveau ?? null });
  }

  await prisma.$transaction(
    rowsToInsert.map((r) => {
      const draft = r.draft!;
      const teamLookup = draft.team ? teamByLabel.get(draft.team.trim().toLowerCase()) : null;
      const resolvedTeamId = importMode === "INTERNAL" ? (teamLookup?.id ?? null) : null;
      const resolvedTeamLabel = importMode === "INTERNAL" ? (teamLookup?.label ?? draft.team ?? null) : draft.team ?? null;
      const resolvedNiveau = importMode === "INTERNAL" ? (teamLookup?.niveau ?? draft.niveau ?? null) : draft.niveau ?? null;

      return prisma.player.create({
        data: {
          name: draft.name,
          type: importMode,
          position: draft.position,
          secondaryPosition: draft.secondaryPosition,
          preferredFoot: draft.preferredFoot,
          team: resolvedTeamLabel,
          teamId: resolvedTeamId,
          niveau: resolvedNiveau,
          currentClub: draft.currentClub,
          status: draft.status,
          advies: draft.advies,
          notes: draft.notes,
          dateOfBirth: draft.dateOfBirth ?? null,
          joinedAt: importMode === "INTERNAL" ? (draft.joinedAt ?? null) : null,
          contractEndDate: importMode === "INTERNAL" ? (draft.contractEndDate ?? null) : null,
          optionYear: importMode === "INTERNAL" ? (draft.optionYear ?? false) : false,
          distanceFromClubKm: importMode === "INTERNAL" ? (draft.distanceFromClubKm ?? null) : null,
          clubId,
          createdById: session.user.id,
        },
      });
    })
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

