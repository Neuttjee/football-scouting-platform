"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type PlayerTypeValue } from "@/components/PlayerTypeToggle";
import { PlanningPlayer, FieldSlot } from "./types";
import { PlayerPicker } from "./PlayerPicker";

export function PlayerPickerModal({
  open,
  onOpenChange,
  slot,
  players,
  selectedType,
  onTypeChange,
  seasonYear,
  onSelectPlayer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: FieldSlot | null;
  players: PlanningPlayer[];
  selectedType: PlayerTypeValue;
  onTypeChange: (type: PlayerTypeValue) => void;
  seasonYear: number;
  onSelectPlayer: (playerId: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="wide"
        className="max-h-[90vh] overflow-y-auto bg-bg-card border-accent-primary text-text-primary"
      >
        <DialogHeader>
          <DialogTitle>
            {slot ? `Speler kiezen voor ${slot.label}` : "Speler kiezen"}
          </DialogTitle>
        </DialogHeader>
        <PlayerPicker
          players={players}
          selectedType={selectedType}
          onTypeChange={onTypeChange}
          seasonYear={seasonYear}
          onSelectPlayer={onSelectPlayer}
        />
      </DialogContent>
    </Dialog>
  );
}
