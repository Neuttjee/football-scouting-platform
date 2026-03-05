"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type ClubUser = { id: string; name: string };
type PlayerOption = { id: string; name: string };

type Props = {
  clubUsers: ClubUser[];
  initialPlayer?: PlayerOption | null;
  lockPlayer?: boolean;
  onSubmit: (fd: FormData) => Promise<void> | void;
  submitLabel?: string;
};

export function TaskForm({
  clubUsers,
  initialPlayer = null,
  lockPlayer = false,
  onSubmit,
  submitLabel = "Opslaan",
}: Props) {
  const [playerQuery, setPlayerQuery] = React.useState("");
  const [playerOpen, setPlayerOpen] = React.useState(false);
  const [playerLoading, setPlayerLoading] = React.useState(false);
  const [playerResults, setPlayerResults] = React.useState<PlayerOption[]>([]);
  const [selectedPlayer, setSelectedPlayer] = React.useState<PlayerOption | null>(
    initialPlayer
  );

  const [assignedToId, setAssignedToId] = React.useState("");

  const sortedClubUsers = React.useMemo(() => {
    return [...clubUsers].sort((a, b) => a.name.localeCompare(b.name, "nl-NL"));
  }, [clubUsers]);

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
    const fd = new FormData(e.currentTarget);
    if (selectedPlayer?.id) fd.set("playerId", selectedPlayer.id);
    else fd.set("playerId", "");
    await onSubmit(fd);
  };

  const externalLocked = assignedToId.trim() !== "";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-4">
        {/* Taak omschrijving */}
        <div>
          <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
            Taak omschrijving *
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="Bijv. Video bekijken van speler X"
            className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-1 focus-visible:ring-accent-primary focus-visible:outline-none"
          />
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
            Deadline
          </label>
          <input
            type="date"
            name="dueDate"
            className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-1 focus-visible:ring-accent-primary focus-visible:outline-none"
          />
        </div>

        {/* Koppel aan speler (zoekveld) */}
        <div>
          <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
            Koppel aan speler
          </label>

          <input type="hidden" name="playerId" value={selectedPlayer?.id || ""} />

          <Popover open={playerOpen} onOpenChange={setPlayerOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary text-left flex items-center justify-between gap-3 focus-visible:ring-1 focus-visible:ring-accent-primary focus-visible:outline-none"
                disabled={lockPlayer}
              >
                <span className="truncate">
                  {selectedPlayer ? selectedPlayer.name : "Geen speler gekoppeld"}
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

                <div className="max-h-56 overflow-y-auto">
                  <button
                    type="button"
                    className="w-full text-left text-sm p-2 rounded hover:bg-bg-hover text-text-secondary"
                    onClick={() => {
                      setSelectedPlayer(null);
                      setPlayerOpen(false);
                      setPlayerQuery("");
                      setPlayerResults([]);
                    }}
                  >
                    Geen speler gekoppeld
                  </button>

                  {playerLoading && (
                    <div className="text-xs text-text-muted p-2">Zoeken…</div>
                  )}

                  {!playerLoading && playerQuery.trim() !== "" && playerResults.length === 0 && (
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

        {/* Toewijzen aan (Gebruiker) */}
        <div>
          <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
            Koppel aan gebruiker
          </label>
          <select
            name="assignedToId"
            value={assignedToId}
            onChange={(e) => setAssignedToId(e.target.value)}
            className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-1 focus-visible:ring-accent-primary focus-visible:outline-none"
          >
            <option value="">Niet toegewezen</option>
            {sortedClubUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {/* Toewijzen aan extern */}
        <div>
          <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
            Toewijzen aan extern
          </label>
          <input
            type="text"
            name="assignedToExternalName"
            placeholder="Naam externe persoon"
            disabled={externalLocked}
            className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-1 focus-visible:ring-accent-primary focus-visible:outline-none disabled:opacity-60"
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

