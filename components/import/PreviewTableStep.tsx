"use client";

import * as React from "react";
import type { PlayerImportPreviewResult } from "@/lib/import/validation";

type PreviewTableStepProps = {
  preview: PlayerImportPreviewResult;
};

export function PreviewTableStep({ preview }: PreviewTableStepProps) {
  const headers = ["Naam", "Geboortedatum", "Positie", "Club", "Status", "Issues"];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span>
          Totaal rijen: <span className="text-text-primary font-semibold">{preview.total}</span>
        </span>
        <span>
          Geldig: <span className="text-emerald-400 font-semibold">{preview.validCount}</span>
        </span>
        <span>
          Ongeldig: <span className="text-destructive font-semibold">{preview.invalidCount}</span>
        </span>
        <span>
          Mogelijke duplicaten:{" "}
          <span className="text-amber-400 font-semibold">{preview.duplicateCount}</span>
        </span>
      </div>

      <div className="rounded-lg border border-border-dark bg-bg-secondary/40 overflow-x-auto overflow-y-auto max-h-[60vh]">
        <table className="min-w-full text-xs">
          <thead className="bg-bg-secondary">
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-3 py-2 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((row) => {
              const draft = row.draft;
              const hasErrors = row.issues.errors.length > 0 || !draft;
              const isDuplicate =
                row.issues.isDuplicate || row.issues.isDuplicateWithinFile;

              return (
                <tr
                  key={row.rowIndex}
                  className="border-t border-border-dark hover:bg-bg-primary/70 transition-colors"
                >
                  <td className="px-3 py-2 text-text-primary">
                    {draft?.name || <span className="text-destructive">Geen naam</span>}
                  </td>
                  <td className="px-3 py-2 text-text-secondary">
                    {draft?.dateOfBirth
                      ? new Date(draft.dateOfBirth).toLocaleDateString("nl-NL")
                      : "-"}
                  </td>
                  <td className="px-3 py-2 text-text-secondary">
                    {draft?.position || "-"}
                  </td>
                  <td className="px-3 py-2 text-text-secondary">
                    {draft?.currentClub || "-"}
                  </td>
                  <td className="px-3 py-2 text-text-secondary">
                    {draft?.status || "-"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {!hasErrors && !isDuplicate && (
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-medium">
                          OK
                        </span>
                      )}
                      {hasErrors && (
                        <span className="inline-flex items-center rounded-full bg-destructive/10 text-destructive border border-destructive/40 px-2 py-0.5 text-[10px] font-medium">
                          Fouten
                        </span>
                      )}
                      {isDuplicate && (
                        <span className="inline-flex items-center rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/40 px-2 py-0.5 text-[10px] font-medium">
                          Mogelijk duplicaat
                        </span>
                      )}
                    </div>
                    {(row.issues.errors.length > 0 || row.issues.warnings.length > 0) && (
                      <details className="mt-1 text-[10px] text-muted-foreground">
                        <summary className="cursor-pointer">Details</summary>
                        <ul className="mt-1 space-y-0.5">
                          {row.issues.errors.map((e, idx) => (
                            <li key={`e-${idx}`} className="text-destructive">
                              {e.field}: {e.message}
                            </li>
                          ))}
                          {row.issues.warnings.map((w, idx) => (
                            <li key={`w-${idx}`} className="text-amber-300">
                              {w.field}: {w.message}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

