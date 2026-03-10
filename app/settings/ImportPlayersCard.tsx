\"use client\";

import { useState } from "react";
import { Lock } from "lucide-react";
import { ImportPlayersWizard } from "./ImportPlayersWizard";

type ImportPlayersCardProps = {
  canImport: boolean;
};

export function ImportPlayersCard({ canImport }: ImportPlayersCardProps) {
  const [open, setOpen] = useState(false);

  const handleStart = () => {
    if (!canImport) return;
    setOpen(true);
  };

  return (
    <>
      <section className="bg-card p-6 rounded-lg shadow border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            Spelers importeren
          </h2>
          {!canImport && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              Alleen beheerders kunnen spelers importeren
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Importeer spelerslijsten vanuit Excel of CSV om externe scoutinglijsten of je eigen selectie snel in het platform te zetten.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleStart}
            disabled={!canImport}
            className={`px-4 py-2 rounded text-sm font-medium transition ${
              canImport
                ? "btn-premium text-white"
                : "bg-muted text-muted-foreground cursor-not-allowed flex items-center gap-1"
            }`}
          >
            {canImport ? "Importeer spelers" : (
              <>
                <Lock className="w-4 h-4" />
                Importeren niet beschikbaar
              </>
            )}
          </button>
        </div>
      </section>

      {canImport && (
        <ImportPlayersWizard open={open} onOpenChange={setOpen} />
      )}
    </>
  );
}

