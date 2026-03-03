// app/internal-players/InternalPlayersPage.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { InternalPlayersTable } from "./InternalPlayersTable";

type InternalPlayer = {
  id: string;
  name: string;
  teamId: string | null;
  teamLabel: string | null;
  originTeamLabel: string | null;
  position: string | null;
  secondaryPosition: string | null;
  preferredFoot: string | null;
  age: number | null;
  joinedAt: Date | null;
  contractEndDate: Date | null;
  isTopTalent: boolean;
};

type TeamOption = {
  id: string;
  name: string;
  code: string | null;
};

type Props = {
  players: InternalPlayer[];
  teams: TeamOption[];
  agingThreshold: number;
  defaultSeasonYear: number;
};

export default function InternalPlayersPage({
  players,
  teams,
  agingThreshold,
  defaultSeasonYear,
}: Props) {
  const initialTeam = teams[0]?.id ?? null;
  const [selectedTeamId, setSelectedTeamId] = React.useState<string | null>(
    initialTeam
  );
  const [seasonYear, setSeasonYear] = React.useState(defaultSeasonYear);

  const seasonOptions = React.useMemo(
    () => Array.from({ length: 6 }, (_, idx) => defaultSeasonYear + idx),
    [defaultSeasonYear]
  );

  const filtered = selectedTeamId
    ? players.filter((p) => p.teamId === selectedTeamId)
    : players;

  return (
    <div className="space-y-6">
      {/* Team toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-bg-secondary/60 border border-border-dark p-1">
          {teams.map((team) => {
            const label = team.code || team.name;
            const active = team.id === selectedTeamId;
            return (
              <button
                key={team.id}
                type="button"
                onClick={() => setSelectedTeamId(team.id)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                  active
                    ? "bg-accent-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary-rgb,255,106,0),0.4)]"
                    : "text-text-muted hover:text-text-primary hover:bg-bg-primary/60"
                )}
              >
                {label}
              </button>
            );
          })}
          {teams.length === 0 && (
            <button
              key="none"
              type="button"
              onClick={() => setSelectedTeamId(null)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                "bg-accent-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary-rgb,255,106,0),0.4)]"
              )}
            >
              Zonder team
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs uppercase tracking-wider text-text-muted">Seizoen</label>
          <select
            value={seasonYear}
            onChange={(e) => setSeasonYear(parseInt(e.target.value, 10))}
            className="border border-border-dark rounded px-2 py-1 text-xs bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
          >
            {seasonOptions.map((year) => (
              <option key={year} value={year}>
                {year}-{year + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabel */}
      <InternalPlayersTable
        players={filtered}
        agingThreshold={agingThreshold}
        seasonYear={seasonYear}
      />
    </div>
  );
}