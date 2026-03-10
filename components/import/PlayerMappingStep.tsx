"use client";

import * as React from "react";
import type {
  FieldMapping,
  ImportSourceColumn,
  ImportTargetField,
} from "@/lib/import/types";

type PlayerMappingStepProps = {
  columns: ImportSourceColumn[];
  targetFields: ImportTargetField[];
  mapping: FieldMapping;
  onMappingChange: (mapping: FieldMapping) => void;
};

export function PlayerMappingStep({
  columns,
  targetFields,
  mapping,
  onMappingChange,
}: PlayerMappingStepProps) {
  const handleChange = (targetKey: string, value: string) => {
    onMappingChange({
      ...mapping,
      [targetKey]: value || null,
    });
  };

  const columnOptions = [
    { value: "", label: "Niet mappen" },
    ...columns.map((c) => ({
      value: c.key,
      label: `Kolom ${String.fromCharCode(65 + c.index)} – ${c.header}`,
    })),
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Koppel de kolommen uit het bronbestand aan de velden van een speler. Vereiste velden zijn gemarkeerd met een sterretje.
      </p>

      <div className="max-h-[320px] overflow-y-auto rounded-lg border border-border-dark bg-bg-secondary/40">
        <table className="w-full text-sm">
          <thead className="bg-bg-secondary">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Spelerveld
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Bronkolom
              </th>
            </tr>
          </thead>
          <tbody>
            {targetFields.map((field) => {
              const current = mapping[field.key] ?? "";
              const isRequired = field.required;
              const hasValue = Boolean(current);

              return (
                <tr
                  key={field.key}
                  className="border-t border-border-dark hover:bg-bg-primary/60 transition-colors"
                >
                  <td className="px-3 py-2 align-middle">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-text-primary font-medium">
                        {field.label}
                        {isRequired && (
                          <span className="ml-1 text-destructive">*</span>
                        )}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        sleutel: <code className="text-xs">{field.key}</code>
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <select
                      className="w-full bg-bg-primary border border-border-dark rounded px-2 py-1 text-xs text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary outline-none"
                      value={current || ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                    >
                      {columnOptions.map((opt) => (
                        <option key={opt.value || "none"} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {isRequired && !hasValue && (
                      <p className="mt-1 text-[11px] text-destructive">
                        Vereist veld, koppel een bronkolom.
                      </p>
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

