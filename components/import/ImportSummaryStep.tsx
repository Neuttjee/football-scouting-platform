"use client";

import * as React from "react";

type ImportSummary = {
  importedCount: number;
  skippedInvalidCount: number;
  skippedDuplicateCount: number;
};

type ImportSummaryStepProps = {
  summary: ImportSummary | null;
};

export function ImportSummaryStep({ summary }: ImportSummaryStepProps) {
  if (!summary) {
    return (
      <p className="text-sm text-muted-foreground">
        Bevestig eerst de import om een samenvatting te zien.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border-dark bg-bg-secondary/40 p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-2">
          Importresultaat
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            <span className="text-text-primary font-semibold">
              {summary.importedCount}
            </span>{" "}
            spelers succesvol geïmporteerd.
          </li>
          <li>
            <span className="text-text-primary font-semibold">
              {summary.skippedInvalidCount}
            </span>{" "}
            rijen overgeslagen vanwege validatiefouten.
          </li>
          <li>
            <span className="text-text-primary font-semibold">
              {summary.skippedDuplicateCount}
            </span>{" "}
            rijen overgeslagen vanwege mogelijke duplicaten.
          </li>
        </ul>
      </div>

      <p className="text-xs text-muted-foreground">
        Ga naar het spelersoverzicht om de geïmporteerde spelers verder te bekijken en te verrijken.
      </p>
    </div>
  );
}

