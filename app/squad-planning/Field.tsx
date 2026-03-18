"use client";

import { cn } from "@/lib/utils";
import { FieldSlot, PlanningPlayer } from "./types";

function getSeasonStartDate(seasonYear: number) {
  // 1 juli = start van het nieuwe seizoen
  return new Date(seasonYear, 6, 1);
}

function isPlayerReadyForSeason(player: PlanningPlayer, seasonYear: number): boolean {
  const seasonStart = getSeasonStartDate(seasonYear);

  // Effective external: nog niet beschikbaar in deze season view.
  if (player.type === "EXTERNAL") return false;

  // Effective internal kan intern zijn (contract) of inbound (plannedInternalFromSeasonYear).
  if (player.sourceType === "EXTERNAL") {
    return (player.plannedInternalFromSeasonYear ?? Infinity) <= seasonYear;
  }

  // Source internal: klaar als contract nog geldig is.
  if (!player.contractEndDate) return true;
  return new Date(player.contractEndDate) >= seasonStart;
}

const MAX_SLOT_CAP = 5;

export function Field({
  slots,
  assignments,
  playersById,
  seasonYear,
  selectedTeamOrder,
  slotMaxOverrides,
  effectiveMaxBySlotId,
  canEdit,
  onDropPlayer,
  onRemoveFromSlot,
  onSlotMaxIncrease,
  onSlotMaxDecrease,
}: {
  slots: FieldSlot[];
  assignments: Record<string, string[]>;
  playersById: Record<string, PlanningPlayer>;
  seasonYear: number;
  selectedTeamOrder: number;
  slotMaxOverrides: Record<string, number>;
  effectiveMaxBySlotId: Record<string, number>;
  canEdit: boolean;
  onDropPlayer: (slotId: string, playerId: string) => void;
  onRemoveFromSlot: (slotId: string, playerId: string) => void;
  onSlotMaxIncrease: (slotId: string) => void;
  onSlotMaxDecrease: (slotId: string) => void;
}) {
  return (
    <div className="card-premium rounded-lg p-0 overflow-hidden border border-accent-primary/50 bg-bg-secondary/40 shadow-inner w-full max-w-[980px] mx-auto">
      {/* Veldverhouding 55:100 (breedte:lengte) – meer in lijn met echt veld */}
      <div className="relative w-full max-h-[92vh] aspect-[55/100]">
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
            const baseMax = slot.maxPlayers ?? 2;
            const effectiveMax = effectiveMaxBySlotId[slot.id] ?? baseMax;
            const canIncrease = effectiveMax < MAX_SLOT_CAP;
            const canDecrease = effectiveMax > baseMax;
            const assignedCount = playerIds.length;
            const decreaseBlocked = canDecrease && assignedCount > effectiveMax - 1;
            return (
              <div
                key={slot.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-48 md:w-60"
                style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                onDragOver={(e) => {
                  if (!canEdit) return;
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  if (!canEdit) return;
                  e.preventDefault();
                  const playerId = e.dataTransfer.getData("text/player-id");
                  if (playerId) onDropPlayer(slot.id, playerId);
                }}
              >
                <div className="rounded-md border border-white/40 bg-bg-secondary/90 p-2 shadow-md backdrop-blur-sm">
                  <div className="flex flex-col gap-1.5">
                    {Array.from({ length: effectiveMax }, (_, idx) => {
                      const isLastRow = idx === effectiveMax - 1;
                      const showPlus = isLastRow && !canDecrease && canIncrease;
                      const showMinus = isLastRow && canDecrease;
                      const player = playerIds[idx] ? playersById[playerIds[idx]] : null;
                      return (
                        <div key={idx} className="flex items-center gap-1.5">
                          <div
                            className={cn(
                              "flex-1 min-w-0 h-8 rounded flex items-center justify-between px-2 text-sm",
                              !player
                                ? "border border-dashed border-border-dark/80 bg-bg-primary/40"
                                : isPlayerReadyForSeason(player, seasonYear)
                                  ? "border border-border-dark bg-bg-primary/70"
                                  : "border border-amber-500/50 bg-amber-500/10"
                            )}
                          >
                            {!player ? null : (
                              <>
                                <span
                                  className={cn(
                                    "truncate font-medium",
                                    isPlayerReadyForSeason(player, seasonYear)
                                      ? "text-text-primary"
                                      : "text-amber-300"
                                  )}
                                >
                                  {player.name}
                                </span>
                                <div className="flex items-center gap-0.5 pl-1 shrink-0">
                                  {player.type === "INTERNAL" && player.teamOrder > selectedTeamOrder && (
                                    <span
                                      className={cn(
                                        "text-[10px] px-1.5 rounded border",
                                        isPlayerReadyForSeason(player, seasonYear)
                                          ? "border-border-dark text-text-primary"
                                          : "border-amber-500/50 text-amber-200"
                                      )}
                                    >
                                      {player.teamLabel}
                                    </span>
                                  )}
                                  {player.type === "EXTERNAL" && (
                                    <span className="text-[10px] px-1.5 rounded border border-amber-500/50 text-amber-200">
                                      EXT
                                    </span>
                                  )}
                                  {canEdit ? (
                                    <button
                                      type="button"
                                      onClick={() => onRemoveFromSlot(slot.id, player.id)}
                                      className="text-text-muted hover:text-text-primary leading-none"
                                      aria-label="Verwijderen"
                                    >
                                      ×
                                    </button>
                                  ) : null}
                                </div>
                              </>
                            )}
                          </div>
                          {canEdit && isLastRow && (showMinus ? (
                            <button
                              type="button"
                              onClick={() => onSlotMaxDecrease(slot.id)}
                              disabled={decreaseBlocked}
                              className={cn(
                                "w-7 h-8 rounded border text-xs flex items-center justify-center shrink-0 flex-shrink-0",
                                !decreaseBlocked
                                  ? "border-border-dark text-text-secondary hover:text-text-primary hover:bg-bg-primary/70"
                                  : "border-border-dark/50 text-text-muted/50 cursor-not-allowed"
                              )}
                              aria-label="Extra slot verwijderen"
                              title={decreaseBlocked ? "Verwijder eerst spelers uit dit slot" : "Extra slot verwijderen"}
                            >
                              −
                            </button>
                          ) : showPlus ? (
                            <button
                              type="button"
                              onClick={() => onSlotMaxIncrease(slot.id)}
                              className="w-7 h-8 rounded border border-border-dark text-text-secondary hover:text-text-primary hover:bg-bg-primary/70 text-xs flex items-center justify-center shrink-0 flex-shrink-0"
                              aria-label="Extra slot toevoegen"
                              title="Extra slot toevoegen"
                            >
                              +
                            </button>
                          ) : null)}
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
