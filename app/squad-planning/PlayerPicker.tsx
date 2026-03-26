"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlanningPlayer } from "./types";
import { PlayerTypeToggle, type PlayerTypeValue } from "@/components/PlayerTypeToggle";

export function PlayerPicker({
  players,
  selectedType,
  onTypeChange,
  seasonYear,
  onSelectPlayer,
}: {
  players: PlanningPlayer[];
  selectedType: PlayerTypeValue;
  onTypeChange: (type: PlayerTypeValue) => void;
  seasonYear: number;
  onSelectPlayer?: (playerId: string) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [positionFilter, setPositionFilter] = React.useState("");
  const [maxAge, setMaxAge] = React.useState<number | "">("");
  const [statusFilter, setStatusFilter] = React.useState("");

  const positions = React.useMemo(() => {
    return Array.from(
      new Set(
        players
          .flatMap((p) => [p.position, p.secondaryPosition])
          .filter((value): value is string => !!value)
      )
    ).sort();
  }, [players]);

  const statuses = React.useMemo(() => {
    return Array.from(
      new Set(players.map((p) => p.status).filter((value): value is string => !!value))
    ).sort();
  }, [players]);

  const seasonStart = React.useMemo(() => new Date(seasonYear, 6, 1), [seasonYear]);

  const isPlayerReadyForSeason = React.useCallback(
    (player: PlanningPlayer) => {
      // Effective external: nog niet beschikbaar voor deze season view.
      if (player.type === "EXTERNAL") return false;

      // Effective internal kan komen vanuit interne speler of inbound externe speler.
      if (player.sourceType === "EXTERNAL") {
        return (player.plannedInternalFromSeasonYear ?? Infinity) <= seasonYear;
      }

      // Source internal: klaar als contract geldig is in dit seizoen.
      if (!player.contractEndDate) return true;
      return new Date(player.contractEndDate) >= seasonStart;
    },
    [seasonStart, seasonYear]
  );

  const filtered = players.filter((p) => {
    if (p.type !== selectedType) return false;
    if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (positionFilter) {
      const combined = `${p.position ?? ""} ${p.secondaryPosition ?? ""}`.toLowerCase();
      if (!combined.includes(positionFilter.toLowerCase())) return false;
    }
    if (maxAge !== "" && p.age !== null && p.age > maxAge) return false;
    if (maxAge !== "" && p.age === null) return false;
    if (selectedType === "EXTERNAL" && statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="card-premium rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-center">
        <PlayerTypeToggle value={selectedType} onChange={onTypeChange} size="sm" />
      </div>
      <div className="space-y-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek speler..."
          className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
          >
            <option value="">Alle posities</option>
            {positions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>

          <input
            type="number"
            min={14}
            max={45}
            value={maxAge}
            onChange={(e) => setMaxAge(e.target.value ? parseInt(e.target.value, 10) : "")}
            placeholder="Max leeftijd"
            className="border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
          />
        </div>

        {selectedType === "EXTERNAL" && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
          >
            <option value="">Alle statussen</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="space-y-2 max-h-[560px] overflow-y-auto">
        {filtered.map((player) => (
          (() => {
            const plannedSeasonYear =
              player.type === "INTERNAL" ? player.plannedInternalFromSeasonYear : null;
            const plannedLabel =
              typeof plannedSeasonYear === "number"
                ? `${plannedSeasonYear}/${plannedSeasonYear + 1}`
                : null;
            const isReady = isPlayerReadyForSeason(player);
            return (
          <button
            key={player.id}
            type="button"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/player-id", player.id);
            }}
            onClick={() => onSelectPlayer?.(player.id)}
            className={cn(
              "w-full text-left border rounded p-2 cursor-grab active:cursor-grabbing hover:border-accent-primary/60",
              player.type === "INTERNAL" ? "border-border-dark bg-bg-secondary/50" : "border-border-dark bg-bg-primary/70"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div
                className={cn(
                  "text-sm font-medium truncate",
                  isReady ? "text-text-primary" : "text-amber-300"
                )}
              >
                {player.name}
              </div>
              <div className="flex items-center gap-1">
                {player.isTopTalent && (
                  <Star
                    className="size-3.5 text-accent-primary"
                    fill="var(--primary-color, #FF6A00)"
                  />
                )}
                {plannedLabel ? (
                  <span
                    className={cn(
                      "text-[10px] px-1 py-0.5 rounded border border-accent-primary/40 text-text-muted"
                    )}
                  >
                    INT vanaf {plannedLabel}
                  </span>
                ) : player.type === "EXTERNAL" ? (
                  <span className="text-[10px] px-1 py-0.5 rounded border border-border-dark text-text-muted">
                    EXT
                  </span>
                ) : null}
              </div>
            </div>
            <div className="text-xs mt-1 text-text-muted">
              {(player.teamLabel || "-")} • {player.position || "-"} •{" "}
              {player.age != null ? `${player.age}j` : "-"}
            </div>
          </button>
            );
          })()
        ))}

        {filtered.length === 0 && (
          <p className="text-sm text-text-muted">Geen spelers met deze filters.</p>
        )}
      </div>
    </div>
  );
}
