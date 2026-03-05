"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type PlayerOption = { id: string; name: string };

type Props = {
  initialPlayer?: PlayerOption | null;
  lockPlayer?: boolean;
  onSubmit: (fd: FormData) => Promise<void> | void;
  submitLabel?: string;
};

export function ContactForm({
  initialPlayer = null,
  lockPlayer = false,
  onSubmit,
  submitLabel = "Opslaan",
}: Props) {
  const [selectedPlayer, setSelectedPlayer] = React.useState<PlayerOption | null>(
    initialPlayer
  );
  const [playerQuery, setPlayerQuery] = React.useState("");
  const [playerOpen, setPlayerOpen] = React.useState(false);
  const [playerLoading, setPlayerLoading] = React.useState(false);
  const [playerResults, setPlayerResults] = React.useState<PlayerOption[]>([]);

  const [outcome, setOutcome] = React.useState("");
  const requiresReason = outcome === "Afgehaakt" || outcome === "Niet haalbaar";

  React.useEffect(() => {
    if (!playerOpen) return;
    const q = playerQuery.trim();
    if (!q) {
      setPlayerResults([]);
      return;
    }

    const ctrl = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        setPlayerLoading(true);
        const res = await fetch(`/api/players/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) {
          setPlayerResults([]);
          return;
        }
        const data = (await res.json()) as { players?: PlayerOption[] };
        setPlayerResults(Array.isArray(data.players) ? data.players : []);
      } finally {
        setPlayerLoading(false);
      }
    }, 200);

    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [playerOpen, playerQuery]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPlayer?.id && !lockPlayer) {
      alert("Selecteer een speler.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    if (selectedPlayer?.id) fd.set("playerId", selectedPlayer.id);
    else fd.set("playerId", "");
    await onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-4">
        {/* Speler (optioneel gelockt) */}
        <div>
          <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
            Speler *
          </label>

          <input type="hidden" name="playerId" value={selectedPlayer?.id || ""} />

          <Popover open={playerOpen} onOpenChange={setPlayerOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary text-left flex items-center justify-between gap-3 focus-visible:ring-1 focus-visible:ring-accent-primary focus-visible:outline-none disabled:opacity-60"
                disabled={lockPlayer}
              >
                <span className="truncate">
                  {selectedPlayer ? selectedPlayer.name : "Selecteer speler..."}
                </span>
                {!lockPlayer && (
                  <span className="text-[10px] text-accent-primary">▼</span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-2 bg-bg-card border-border-dark"
              align="start"
            >
              <div className="space-y-2">
                <input
                  type="text"
                  value={playerQuery}
                  onChange={(e) => setPlayerQuery(e.target.value)}
                  placeholder="Zoek speler..."
                  className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-1 focus-visible:ring-accent-primary focus-visible:outline-none"
                  autoFocus
                />

                <div className="max-h-56 overflow-y-auto mt-1">
                  {playerLoading && (
                    <div className="text-xs text-text-muted p-2">Zoeken…</div>
                  )}

                  {!playerLoading &&
                    playerQuery.trim() !== "" &&
                    playerResults.length === 0 && (
                      <div className="text-xs text-text-muted p-2">
                        Geen spelers gevonden.
                      </div>
                    )}

                  {playerResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="w-full text-left text-sm p-2 rounded hover:bg-bg-hover text-text-primary"
                      onClick={() => {
                        setSelectedPlayer(p);
                        setPlayerOpen(false);
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Type */}
        <div>
          <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
            Type *
          </label>
          <select
            name="type"
            required
            className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
          >
            <option value="">Selecteer...</option>
            {[
              "Intro benadering",
              "Follow up",
              "Gesprek",
              "Meetraining",
              "Aanbod",
              "Overig",
            ].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Kanaal */}
        <div>
          <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
            Kanaal *
          </label>
          <select
            name="channel"
            required
            className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
          >
            <option value="">Selecteer...</option>
            {[
              "Whatsapp",
              "Telefoon",
              "Op de club",
              "Training",
              "Via derde",
              "E-mail",
              "Overig",
            ].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Uitkomst */}
        <div>
          <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
            Uitkomst
          </label>
          <select
            name="outcome"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
          >
            <option value="">Geen of onbekend</option>
            {[
              "Positief",
              "Neutraal",
              "Twijfel",
              "Negatief",
              "Afgehaakt",
              "Niet haalbaar",
            ].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Reden (conditioneel) */}
        {requiresReason && (
          <div>
            <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
              Reden (verplicht bij Afgehaakt / Niet haalbaar) *
            </label>
            <input
              type="text"
              name="reason"
              required={requiresReason}
              className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
            />
          </div>
        )}

        {/* Notities */}
        <div>
          <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
            Notities
          </label>
          <textarea
            name="notes"
            rows={3}
            className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" className="btn-premium text-white">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

