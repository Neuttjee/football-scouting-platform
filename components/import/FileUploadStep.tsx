"use client";

import * as React from "react";

type FileUploadStepProps = {
  onFileSelected: (file: File) => void;
  isBusy?: boolean;
  error?: string | null;
};

export function FileUploadStep({ onFileSelected, isBusy, error }: FileUploadStepProps) {
  const [localError, setLocalError] = React.useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.toLowerCase();
    if (!ext.endsWith(".csv") && !ext.endsWith(".xlsx") && !ext.endsWith(".xls")) {
      setLocalError("Ondersteunde formaten: CSV of Excel (.xlsx).");
      return;
    }

    setLocalError(null);
    onFileSelected(file);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Kies een CSV- of Excelbestand met spelers. De kolommen kun je in de volgende stap koppelen aan spelersvelden.
      </p>

      <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-border-dark rounded-lg p-6 bg-bg-secondary/40 cursor-pointer hover:border-accent-primary/70 transition-colors">
        <span className="text-sm font-medium text-text-primary">
          Bestand selecteren
        </span>
        <span className="text-xs text-muted-foreground">
          Ondersteund: .csv, .xlsx
        </span>
        <input
          type="file"
          accept=".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={handleChange}
          disabled={isBusy}
        />
      </label>

      {(error || localError) && (
        <div className="text-xs text-destructive bg-destructive/10 border border-destructive/40 rounded px-3 py-2">
          {error || localError}
        </div>
      )}

      {isBusy && (
        <p className="text-xs text-muted-foreground">
          Bestand wordt geüpload en ingelezen...
        </p>
      )}
    </div>
  );
}

