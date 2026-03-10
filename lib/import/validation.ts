import prisma from "@/lib/prisma";
import type { FieldMapping, ParsedFile, ParsedRow } from "./types";

export type RowFieldError = {
  field: string;
  message: string;
};

export type RowIssue = {
  rowIndex: number;
  errors: RowFieldError[];
  warnings: RowFieldError[];
  isDuplicate: boolean;
  isDuplicateWithinFile: boolean;
};

export type PlayerDraft = {
  name: string;
  dateOfBirth?: Date | null;
  position?: string | null;
  secondaryPosition?: string | null;
  preferredFoot?: string | null;
  currentClub?: string | null;
  team?: string | null;
  niveau?: string | null;
  status?: string | null;
  step?: string | null;
  advies?: string | null;
  notes?: string | null;
  type?: "INTERNAL" | "EXTERNAL";
};

export type PlayerImportPreviewRow = {
  rowIndex: number;
  source: ParsedRow;
  draft: PlayerDraft | null;
  issues: RowIssue;
};

export type PlayerImportPreviewResult = {
  rows: PlayerImportPreviewRow[];
  total: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
};

function safeString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
}

function parseDate(value: unknown): Date | null {
  const raw = safeString(value);
  if (!raw) return null;

  // Probeer een paar veelvoorkomende formaten
  const iso = Date.parse(raw);
  if (!Number.isNaN(iso)) return new Date(iso);

  // dd-MM-yyyy
  const m = raw.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (!Number.isNaN(d.getTime())) return d;
  }

  return null;
}

type DuplicateIndex = {
  byNameDob: Map<string, true>;
  byNameClub: Map<string, true>;
};

async function buildDuplicateIndex(clubId: string): Promise<DuplicateIndex> {
  const existing = await prisma.player.findMany({
    where: { clubId },
    select: { name: true, dateOfBirth: true, currentClub: true },
  });

  const byNameDob = new Map<string, true>();
  const byNameClub = new Map<string, true>();

  for (const p of existing) {
    const name = p.name?.trim().toLowerCase();
    if (!name) continue;
    if (p.dateOfBirth) {
      const key = `${name}|${p.dateOfBirth.toISOString().slice(0, 10)}`;
      byNameDob.set(key, true);
    }
    if (p.currentClub) {
      const key = `${name}|${p.currentClub.trim().toLowerCase()}`;
      byNameClub.set(key, true);
    }
  }

  return { byNameDob, byNameClub };
}

export async function buildPlayerImportPreview(
  clubId: string,
  parsed: ParsedFile,
  mapping: FieldMapping
): Promise<PlayerImportPreviewResult> {
  const duplicateIndex = await buildDuplicateIndex(clubId);

  const fileDuplicatesByNameDob = new Map<string, number>();
  const fileDuplicatesByNameClub = new Map<string, number>();

  const rows: PlayerImportPreviewRow[] = [];

  parsed.rows.forEach((row, index) => {
    const errors: RowFieldError[] = [];
    const warnings: RowFieldError[] = [];

    const name = safeString(row[mapping["name"] || ""]);
    if (!name) {
      errors.push({ field: "name", message: "Naam is verplicht." });
    }

    const dateOfBirth = parseDate(row[mapping["dateOfBirth"] || ""]);
    if (row[mapping["dateOfBirth"] || ""] && !dateOfBirth) {
      errors.push({
        field: "dateOfBirth",
        message: "Ongeldige geboortedatum.",
      });
    }

    const position = safeString(row[mapping["position"] || ""]);
    const secondaryPosition = safeString(row[mapping["secondaryPosition"] || ""]);
    const preferredFoot = safeString(row[mapping["preferredFoot"] || ""]);
    const currentClub = safeString(row[mapping["currentClub"] || ""]);
    const team = safeString(row[mapping["team"] || ""]);
    const niveau = safeString(row[mapping["niveau"] || ""]);
    const status = safeString(row[mapping["status"] || ""]);
    const step = safeString(row[mapping["step"] || ""]);
    const advies = safeString(row[mapping["advies"] || ""]);
    const notes = safeString(row[mapping["notes"] || ""]);

    let type: "INTERNAL" | "EXTERNAL" | undefined;
    const typeRaw = safeString(row[mapping["type"] || ""]);
    if (typeRaw) {
      const t = typeRaw.toUpperCase();
      if (t === "INTERNAL" || t === "INTERN") type = "INTERNAL";
      else if (t === "EXTERNAL" || t === "EXTERN") type = "EXTERNAL";
      else {
        warnings.push({
          field: "type",
          message: `Onbekend type "${typeRaw}", standaard EXTERNAL wordt gebruikt.`,
        });
      }
    }

    const draft: PlayerDraft | null = name
      ? {
          name,
          dateOfBirth,
          position,
          secondaryPosition,
          preferredFoot,
          currentClub,
          team,
          niveau,
          status,
          step,
          advies,
          notes,
          type,
        }
      : null;

    let isDuplicate = false;
    let isDuplicateWithinFile = false;

    if (name) {
      const lowerName = name.toLowerCase();
      if (dateOfBirth) {
        const key = `${lowerName}|${dateOfBirth.toISOString().slice(0, 10)}`;
        if (duplicateIndex.byNameDob.has(key)) {
          isDuplicate = true;
        }
        const count = fileDuplicatesByNameDob.get(key) ?? 0;
        fileDuplicatesByNameDob.set(key, count + 1);
        if (count >= 1) {
          isDuplicateWithinFile = true;
        }
      } else if (currentClub) {
        const key = `${lowerName}|${currentClub.toLowerCase()}`;
        if (duplicateIndex.byNameClub.has(key)) {
          isDuplicate = true;
        }
        const count = fileDuplicatesByNameClub.get(key) ?? 0;
        fileDuplicatesByNameClub.set(key, count + 1);
        if (count >= 1) {
          isDuplicateWithinFile = true;
        }
      }
    }

    if (isDuplicate || isDuplicateWithinFile) {
      warnings.push({
        field: "duplicate",
        message: "Mogelijke duplicaat met bestaande spelers of binnen dit bestand.",
      });
    }

    const issues: RowIssue = {
      rowIndex: index,
      errors,
      warnings,
      isDuplicate,
      isDuplicateWithinFile,
    };

    rows.push({
      rowIndex: index,
      source: row,
      draft,
      issues,
    });
  });

  const total = rows.length;
  const invalidCount = rows.filter((r) => r.issues.errors.length > 0 || !r.draft).length;
  const duplicateCount = rows.filter(
    (r) => r.issues.isDuplicate || r.issues.isDuplicateWithinFile
  ).length;
  const validCount = total - invalidCount;

  return {
    rows,
    total,
    validCount,
    invalidCount,
    duplicateCount,
  };
}

