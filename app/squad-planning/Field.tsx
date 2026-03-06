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
    <div className="card-premium rounded-lg p-0 overflow-hidden border border-accent-primary/50 bg-bg-secondary/40 shadow-inner w-[80%] max-w-[900px] mx-auto">
      {/* Veldverhouding 68:105 (breedte:lengte) – langer en iets breder */}
      <div className="relative w-full max-h-[75vh] aspect-[68/105]">
          {/* Veldlijnen: buitenlijn (iets dunner) */}
          <div className="absolute inset-0 rounded-[6px] border border-accent-primary/80" />

          {/* Middellijn */}
          <div className="absolute left-0 right-0 top-1/2 h-0 border-t border-accent-primary/80 -translate-y-px" />

          {/* Cirkel midden */}
          <div className="absolute left-1/2 top-1/2 w-[22%] aspect-square rounded-full border border-accent-primary/80 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-accent-primary -translate-x-1/2 -translate-y-1/2" />

          {/* 16m (strafgebied) – aan beide korte zijden */}
          <div className="absolute left-[18%] right-[18%] top-0 h-[16%] border-b border-l border-r border-accent-primary/80 rounded-b-[3px]" />
          <div className="absolute left-[18%] right-[18%] bottom-0 h-[16%] border-t border-l border-r border-accent-primary/80 rounded-t-[3px]" />

          {/* 5m (doelgebied) */}
          <div className="absolute left-[28%] right-[28%] top-0 h-[6%] border-b border-l border-r border-accent-primary/70 rounded-b-[2px]" />
          <div className="absolute left-[28%] right-[28%] bottom-0 h-[6%] border-t border-l border-r border-accent-primary/70 rounded-t-[2px]" />

          {/* Penaltystippen */}
          <div className="absolute left-1/2 top-[11%] w-2 h-2 rounded-full bg-accent-primary -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute left-1/2 top-[89%] w-2 h-2 rounded-full bg-accent-primary -translate-x-1/2 -translate-y-1/2" />

          {slots.map((slot) => {
            const playerIds = assignments[slot.id] ?? [];
            return (
              <div
                key={slot.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-40 md:w-48"
                style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const playerId = e.dataTransfer.getData("text/player-id");
                  if (playerId) onDropPlayer(slot.id, playerId);
                }}
              >
                <div className="rounded-md border border-white/40 bg-bg-secondary/90 p-1.5 shadow-md backdrop-blur-sm">
                  <div className="space-y-1">
                    {Array.from({ length: 2 }, (_, idx) => {
                      const player = playerIds[idx] ? playersById[playerIds[idx]] : null;
                      if (!player) {
                        return (
                          <div
                            key={idx}
                            className="h-7 rounded border border-dashed border-border-dark/80 bg-bg-primary/40"
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
                            "h-7 rounded border border-border-dark px-1.5 flex items-center justify-between text-xs",
                            expired ? "text-text-muted" : "text-text-primary",
                            "bg-bg-primary/70"
                          )}
                        >
                          <span className="truncate font-medium">{player.name}</span>
                          <div className="flex items-center gap-0.5 pl-1 shrink-0">
                            {fromFeederTeam && (
                              <span className="text-[9px] px-1 rounded border border-border-dark text-text-muted">
                                {player.teamLabel}
                              </span>
                            )}
                            {isExternal && (
                              <span className="text-[9px] px-1 rounded border border-border-dark text-text-muted">
                                EXT
                              </span>
                            )}
                            {isAging && (
                              <span className="text-[9px] px-1 rounded border border-accent-primary/40 text-text-muted">
                                +
                              </span>
                            )}
                            {isDouble && (
                              <span className="text-[9px] px-1 rounded border border-accent-primary/40 text-text-muted">
                                2×
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => onRemoveFromSlot(slot.id, player.id)}
                              className="text-text-muted hover:text-text-primary leading-none"
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
