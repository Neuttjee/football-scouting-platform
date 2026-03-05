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
  const playerSlotsToShow = 2;

  return (
    <div className="card-premium rounded-xl p-4">
      <div className="w-full max-w-[340px] mx-auto relative rounded-xl overflow-hidden border-2 border-accent-primary/50 bg-[#2d5016] shadow-inner">
        {/* Veldverhouding 68:105 (breedte:lengte) – langer en smaller */}
        <div className="relative w-full aspect-[68/105]">
          {/* Veldlijnen: buitenlijn */}
          <div className="absolute inset-0 rounded-[3px] border-2 border-white/90" />

          {/* Middellijn */}
          <div className="absolute left-0 right-0 top-1/2 h-0 border-t-2 border-white/90 -translate-y-px" />

          {/* Cirkel midden */}
          <div className="absolute left-1/2 top-1/2 w-[22%] aspect-square rounded-full border-2 border-white/90 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-white/90 -translate-x-1/2 -translate-y-1/2" />

          {/* 16m (strafschopgebied) – ca. 15,7% van doellijn */}
          <div className="absolute left-0 right-0 top-0 h-[15.7%] border-b-2 border-r-2 border-l-2 border-white/90 rounded-t-[2px]" />
          <div className="absolute left-0 right-0 bottom-0 h-[15.7%] border-t-2 border-r-2 border-l-2 border-white/90 rounded-b-[2px]" />

          {/* 5m (doelgebied) – ca. 5,2% */}
          <div className="absolute left-0 right-0 top-0 h-[5.2%] border-b-2 border-r-2 border-l-2 border-white/80 rounded-t-[1px]" />
          <div className="absolute left-0 right-0 bottom-0 h-[5.2%] border-t-2 border-r-2 border-l-2 border-white/80 rounded-b-[1px]" />

          {/* Penaltystip – 10,5% van doellijn, gecentreerd */}
          <div className="absolute left-1/2 top-[10.5%] w-2 h-2 rounded-full bg-white/95 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute left-1/2 top-[89.5%] w-2 h-2 rounded-full bg-white/95 -translate-x-1/2 -translate-y-1/2" />

          {slots.map((slot) => {
            const playerIds = assignments[slot.id] ?? [];
            return (
              <div
                key={slot.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-28"
                style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const playerId = e.dataTransfer.getData("text/player-id");
                  if (playerId) onDropPlayer(slot.id, playerId);
                }}
              >
                <div className="rounded-md border border-white/40 bg-bg-secondary/90 p-1.5 shadow-md backdrop-blur-sm">
                  <div className="space-y-0.5">
                    {Array.from({ length: playerSlotsToShow }, (_, idx) => {
                      const player = playerIds[idx] ? playersById[playerIds[idx]] : null;
                      if (!player) {
                        return (
                          <div
                            key={idx}
                            className="h-5 rounded border border-dashed border-border-dark/80 bg-bg-primary/40"
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
                            "h-5 rounded border border-border-dark px-1 flex items-center justify-between text-[10px]",
                            expired ? "text-text-muted" : "text-text-primary",
                            "bg-bg-primary/70"
                          )}
                        >
                          <span className="truncate font-medium">{player.name}</span>
                          <div className="flex items-center gap-0.5 pl-1 shrink-0">
                            {fromFeederTeam && (
                              <span className="text-[8px] px-0.5 rounded border border-border-dark text-text-muted">
                                {player.teamLabel}
                              </span>
                            )}
                            {isExternal && (
                              <span className="text-[8px] px-0.5 rounded border border-border-dark text-text-muted">
                                EXT
                              </span>
                            )}
                            {isAging && (
                              <span className="text-[8px] px-0.5 rounded border border-accent-primary/40 text-text-muted">
                                +
                              </span>
                            )}
                            {isDouble && (
                              <span className="text-[8px] px-0.5 rounded border border-accent-primary/40 text-text-muted">
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
    </div>
  );
}
