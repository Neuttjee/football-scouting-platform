"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { FileUploadStep } from "@/components/import/FileUploadStep";
import { PlayerMappingStep } from "@/components/import/PlayerMappingStep";
import { PreviewTableStep } from "@/components/import/PreviewTableStep";
import { ImportSummaryStep } from "@/components/import/ImportSummaryStep";
import type { FieldMapping, ParsedFile } from "@/lib/import/types";
import { playerTargetFields } from "@/lib/import/playerImportConfig";
import { suggestColumnMapping } from "@/lib/import/mapping";
import { executePlayerImport, parseImportFile, preparePlayerImport } from "./importPlayersActions";
import type { PlayerImportPreviewResult } from "@/lib/import/validation";

type ImportPlayersWizardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export function ImportPlayersWizard({ open, onOpenChange }: ImportPlayersWizardProps) {
  const [step, setStep] = React.useState<WizardStep>(1);
  const [parsedFile, setParsedFile] = React.useState<ParsedFile | null>(null);
  const [mapping, setMapping] = React.useState<FieldMapping>({});
  const [preview, setPreview] = React.useState<PlayerImportPreviewResult | null>(null);
  const [summary, setSummary] = React.useState<{
    importedCount: number;
    skippedInvalidCount: number;
    skippedDuplicateCount: number;
  } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isBusy, setIsBusy] = React.useState(false);

  const close = () => {
    onOpenChange(false);
    setStep(1);
    setParsedFile(null);
    setMapping({});
    setPreview(null);
    setSummary(null);
    setError(null);
    setIsBusy(false);
  };

  const steps: { id: WizardStep; label: string }[] = [
    { id: 1, label: "Bestand kiezen" },
    { id: 2, label: "Inlezen" },
    { id: 3, label: "Kolommen mappen" },
    { id: 4, label: "Preview" },
    { id: 5, label: "Validatie" },
    { id: 6, label: "Bevestigen" },
    { id: 7, label: "Resultaat" },
  ];

  const handleFileSelected = async (file: File) => {
    setError(null);
    setIsBusy(true);
    setStep(2);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await parseImportFile(formData);
      setParsedFile(result.parsed);
      const initial = suggestColumnMapping(result.parsed.columns, playerTargetFields);
      setMapping(initial);
      setStep(3);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Bestand kon niet worden ingelezen.");
      setStep(1);
    } finally {
      setIsBusy(false);
    }
  };

  const canGoNext = () => {
    if (step === 1) return !!parsedFile;
    if (step === 3) {
      // Vereist: minimaal name gemapt
      return Boolean(mapping["name"]);
    }
    if (step === 4 || step === 5) {
      return Boolean(preview);
    }
    return true;
  };

  const handleBuildPreview = async () => {
    if (!parsedFile) return;
    setIsBusy(true);
    setError(null);
    try {
      const result = await preparePlayerImport(parsedFile, mapping);
      setPreview(result);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Kon preview niet opbouwen.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!parsedFile) return;
    setIsBusy(true);
    setError(null);
    try {
      const result = await executePlayerImport(parsedFile, mapping, {
        importDuplicates: false,
      });
      setSummary(result);
      setStep(7);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Import uitvoeren is mislukt.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[min(1100px,100%-2rem)] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Spelers importeren</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <ol className="flex flex-wrap gap-2 text-xs">
            {steps.map((s) => (
              <li
                key={s.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-1 rounded-full border",
                  step === s.id
                    ? "bg-accent-primary/20 border-accent-primary text-accent-primary"
                    : step > s.id
                    ? "bg-bg-secondary border-border-dark text-text-secondary"
                    : "bg-transparent border-border-dark text-text-muted"
                )}
              >
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-border-dark text-[10px]">
                  {s.id}
                </span>
                <span>{s.label}</span>
              </li>
            ))}
          </ol>

          <div className="min-h-[260px] rounded-lg border border-border-dark bg-bg-primary p-4">
            {(step === 1 || step === 2) && (
              <FileUploadStep onFileSelected={handleFileSelected} isBusy={isBusy} error={error} />
            )}
            {step === 3 && parsedFile && (
              <PlayerMappingStep
                columns={parsedFile.columns}
                targetFields={playerTargetFields}
                mapping={mapping}
                onMappingChange={setMapping}
              />
            )}
            {step === 4 && preview && <PreviewTableStep preview={preview} />}
            {step === 5 && preview && <PreviewTableStep preview={preview} />}
            {step === 6 && <ImportSummaryStep summary={summary} />}
            {step === 7 && <ImportSummaryStep summary={summary} />}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={close}
              className="text-sm text-muted-foreground hover:text-text-primary transition"
            >
              Annuleren
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep((s) => (s > 1 ? ((s - 1) as WizardStep) : s))}
                disabled={step === 1}
                className="px-4 py-2 rounded text-sm bg-bg-secondary text-text-secondary border border-border-dark disabled:opacity-40"
              >
                Vorige
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (step === 3 && !preview) {
                    await handleBuildPreview();
                    setStep(4);
                  } else if (step === 6) {
                    await handleExecuteImport();
                  } else if (step === 7) {
                    close();
                    if (typeof window !== "undefined") {
                      window.location.href = "/players";
                    }
                  } else {
                    setStep((s) => (s < 7 ? ((s + 1) as WizardStep) : s));
                  }
                }}
                disabled={!canGoNext() || isBusy}
                className="px-4 py-2 rounded text-sm btn-premium text-white disabled:opacity-40"
              >
                {step === 6
                  ? "Import bevestigen"
                  : step === 7
                  ? "Voltooien en naar spelers"
                  : "Volgende"}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


