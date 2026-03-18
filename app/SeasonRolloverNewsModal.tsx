"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Run = {
  seasonYear: number;
  inboundCount: number;
  outboundCount: number;
  ranAt: string;
};

export function SeasonRolloverNewsModal() {
  const [open, setOpen] = React.useState(false);
  const [run, setRun] = React.useState<Run | null>(null);

  React.useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/announcements/season-rollover");
      if (!res.ok) return;
      const data = await res.json();
      if (data?.show && data?.run) {
        setRun(data.run as Run);
        setOpen(true);
      }
    };
    void load();
  }, []);

  const dismiss = async () => {
    if (!run) {
      setOpen(false);
      return;
    }
    await fetch("/api/announcements/season-rollover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seasonYear: run.seasonYear }),
    }).catch(() => null);
    setOpen(false);
  };

  const seasonLabel = run ? `${run.seasonYear}/${run.seasonYear + 1}` : "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md bg-bg-card border-accent-primary text-text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
        <DialogHeader>
          <DialogTitle>Seizoenswissel uitgevoerd</DialogTitle>
        </DialogHeader>
        {run ? (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              De automatische seizoensroutine is uitgevoerd voor seizoen{" "}
              <span className="text-text-primary font-medium">{seasonLabel}</span>.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border-dark bg-bg-secondary/40 p-3">
                <p className="text-[10px] uppercase tracking-wider text-text-muted">Extern → intern</p>
                <p className="text-xl font-bold text-text-primary mt-1">{run.inboundCount}</p>
              </div>
              <div className="rounded-lg border border-border-dark bg-bg-secondary/40 p-3">
                <p className="text-[10px] uppercase tracking-wider text-text-muted">Intern → extern</p>
                <p className="text-xl font-bold text-text-primary mt-1">{run.outboundCount}</p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => void dismiss()}
                className="px-4 py-2 rounded text-sm btn-premium text-white"
              >
                Oké
              </button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

