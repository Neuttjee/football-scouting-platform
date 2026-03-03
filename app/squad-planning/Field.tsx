"use client";

import { cn } from "@/lib/utils";
import { FieldSlot, PlanningPlayer } from "./types";

function isContractExpired(player: PlanningPlayer, seasonYear: number) {
  if (player.type !== "INTERNAL" || !player.contractEndDate) return false;
  const seasonStart = new Date(seasonYear, 6, 1);
  return new Date(player.contractEndDate) < seasonStart;
}

export function Field({
  slots,
  assignments,
  playersById,
  seasonYear,
  agingThreshold,
  selectedTeamOrder,
  duplicatePlayerIds,
  onDropPlayer,
  onRemoveFromSlot,
}: {
  slots: FieldSlot[];
  assignments: Record<string, string[]>;
  playersById: Record<string, PlanningPlayer>;
  seasonYear: number;
  agingThreshold: number;
  selectedTeamOrder: number;
  duplicatePlayerIds: Set<string>;
  onDropPlayer: (slotId: string, playerId: string) => void;
  onRemoveFromSlot: (slotId: string, playerId: string) => void;
}) {
  return (
    <div className="card-premium rounded-xl p-4">
      <div className="relative h-[740px] rounded-xl border border-accent-primary/40 bg-bg-primary overflow-hidden">
        <div className="absolute inset-4 border border-accent-primary/50 rounded-lg" />
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 border-t border-accent-primary/30" />
        <div className="absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-primary/30" />

        {slots.map((slot) => {
          const playerIds = assignments[slot.id] ?? [];
          return (
            <div
              key={slot.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-40"
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const playerId = e.dataTransfer.getData("text/player-id");
                if (playerId) onDropPlayer(slot.id, playerId);
              }}
            >
              <div className="rounded-lg border border-border-dark bg-bg-secondary/70 p-2 shadow-sm">
                <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">
                  {slot.label}
                </div>
                <div className="space-y-1">
                  {[0, 1, 2].map((idx) => {
                    const player = playerIds[idx] ? playersById[playerIds[idx]] : null;
                    if (!player) {
                      return (
                        <div
                          key={idx}
                          className="h-7 rounded border border-dashed border-border-dark/80 bg-bg-primary/30"
                        />
                      );
                    }

                    const expired = isContractExpired(player, seasonYear);
                    const isAging = player.age !== null && player.age >= agingThreshold;
                    const isExternal = player.type === "EXTERNAL";
                    const isDouble = duplicatePlayerIds.has(player.id);
                    const fromFeederTeam =
                      player.type === "INTERNAL" && player.teamOrder > selectedTeamOrder;

                    return (
                      <div
                        key={idx}
                        className={cn(
                          "h-7 rounded border border-border-dark px-1.5 flex items-center justify-between text-[11px]",
                          expired ? "text-text-muted" : "text-text-primary",
                          "bg-bg-primary/60"
                        )}
                      >
                        <div className="truncate">
                          <span className="mr-1 font-medium">{idx + 1}.</span>
                          {player.name}
                        </div>
                        <div className="flex items-center gap-1 pl-1">
                          {fromFeederTeam && (
                            <span className="text-[9px] px-1 py-0.5 rounded border border-border-dark text-text-muted">
                              {player.teamLabel}
                            </span>
                          )}
                          {isExternal && (
                            <span className="text-[9px] px-1 py-0.5 rounded border border-border-dark text-text-muted">
                              EXT
                            </span>
                          )}
                          {isAging && (
                            <span className="text-[9px] px-1 py-0.5 rounded border border-accent-primary/40 text-text-muted">
                              Aging
                            </span>
                          )}
                          {isDouble && (
                            <span className="text-[9px] px-1 py-0.5 rounded border border-accent-primary/40 text-text-muted">
                              Dubbel
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => onRemoveFromSlot(slot.id, player.id)}
                            className="text-text-muted hover:text-text-primary"
                            aria-label="Verwijderen"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
