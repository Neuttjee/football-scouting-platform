import type { FieldMapping, ImportSourceColumn, ImportTargetField } from "./types";
import { playerFieldAliases } from "./playerImportConfig";

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_\-]+/g, " ");
}

function scoreMatch(header: string, targetKey: string): number {
  const normHeader = normalize(header);
  const normKey = normalize(targetKey);
  let score = 0;

  if (normHeader === normKey) score += 10;
  if (normHeader.includes(normKey)) score += 5;

  const aliases = playerFieldAliases[targetKey] || [];
  for (const alias of aliases) {
    const normAlias = normalize(alias);
    if (normHeader === normAlias) score += 10;
    else if (normHeader.includes(normAlias)) score += 5;
  }

  return score;
}

export function suggestColumnMapping(
  columns: ImportSourceColumn[],
  targetFields: ImportTargetField[]
): FieldMapping {
  const mapping: FieldMapping = {};

  for (const field of targetFields) {
    let best: { key: string; score: number } | null = null;
    for (const col of columns) {
      const s = scoreMatch(col.header || col.key, field.key);
      if (s > 0 && (!best || s > best.score)) {
        best = { key: col.key, score: s };
      }
    }

    mapping[field.key] = best ? best.key : null;
  }

  return mapping;
}

