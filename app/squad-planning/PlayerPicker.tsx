"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlanningPlayer } from "./types";

export function PlayerPicker({
  players,
  selectedType,
  onTypeChange,
}: {
  players: PlanningPlayer[];
  selectedType: "INTERNAL" | "EXTERNAL";
  onTypeChange: (type: "INTERNAL" | "EXTERNAL") => void;
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
      <div className="inline-flex items-center gap-2 rounded-full bg-bg-secondary/60 border border-border-dark p-1">
        {(["INTERNAL", "EXTERNAL"] as const).map((type) => {
          const active = type === selectedType;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onTypeChange(type)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                active
                  ? "bg-accent-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary-rgb,255,106,0),0.4)]"
                  : "text-text-muted hover:text-text-primary hover:bg-bg-primary/60"
              )}
            >
              {type === "INTERNAL" ? "Intern" : "Extern"}
            </button>
          );
        })}
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
          <div
            key={player.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/player-id", player.id);
            }}
            className="border border-border-dark rounded p-2 bg-bg-secondary/50 cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-text-primary font-medium truncate">
                {player.name}
              </div>
              <div className="flex items-center gap-1">
                {player.isTopTalent && (
                  <Star
                    className="size-3.5 text-accent-primary"
                    fill="var(--primary-color, #FF6A00)"
                  />
                )}
                {player.type === "EXTERNAL" && (
                  <span className="text-[10px] px-1 py-0.5 rounded border border-border-dark text-text-muted">
                    EXT
                  </span>
                )}
              </div>
            </div>
            <div className="text-xs text-text-muted mt-1">
              {(player.teamLabel || "-")} • {player.position || "-"} •{" "}
              {player.age != null ? `${player.age}j` : "-"}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-sm text-text-muted">Geen spelers met deze filters.</p>
        )}
      </div>
    </div>
  );
}
