"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updatePlayerField, updatePlayer } from "@/app/players/actions";
import { createTask } from "@/app/tasks/actions";
import { createContact } from "@/app/players/[id]/contacts/actions";
import { targetSteps, targetStatuses, adviesOptions } from "@/lib/statusMapping";
import { PlayerDobAgeFields } from "@/app/players/PlayerDobAgeFields";

export interface PlayerForActions {
  id: string;
  name: string;
  type: "INTERNAL" | "EXTERNAL";
  position: string | null;
  currentClub: string | null;
  team: string | null;
  secondaryPosition: string | null;
  preferredFoot: string | null;
  dateOfBirth: Date | null;
  age: number | null;
  step: string | null;
  status: string | null;
  advies: string | null;
  notes: string | null;
}

const STATUS_OPTIONS = targetStatuses;
const STEP_OPTIONS = targetSteps;
const ADVIES_OPTIONS = adviesOptions;

export function PlayerActionsMenu({
  player,
  clubUsers,
  // clubName is currently unused here but passed from callers for future layout improvements
  // to keep types aligned across the app.
  clubName,
}: {
  player: PlayerForActions;
  clubUsers: { id: string; name: string }[];
  clubName?: string | null;
}) {
  const router = useRouter();
  const [openEdit, setOpenEdit] = React.useState(false);
  const [openTask, setOpenTask] = React.useState(false);
  const [openContact, setOpenContact] = React.useState(false);
  const [outcome, setOutcome] = React.useState("");
  const requiresReason =
    outcome === "Afgehaakt" || outcome === "Niet haalbaar";

  const [playerType, setPlayerType] = React.useState<
    "EXTERNAL" | "INTERNAL"
  >(player.type === "INTERNAL" ? "INTERNAL" : "EXTERNAL");

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("type", playerType); // zorg dat type meegaat
    await updatePlayer(player.id, formData);
    setOpenEdit(false);
    router.refresh();
  };

  const handleTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("playerId", player.id);
    await createTask(formData);
    setOpenTask(false);
    router.refresh();
  };

  const handleContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createContact(player.id, formData);
    setOpenContact(false);
    router.refresh();
  };

  return (
    <div className="flex justify-end pr-2">
      {/* Plus-knop opent menu via Dialog of DropdownMenu; dit is je bestaande structuur */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogTrigger asChild>
          <button className="p-1.5 bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 rounded-md transition-colors outline-none">
            <Plus className="h-4 w-4" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-bg-card border-accent-primary text-text-primary">
          <DialogHeader>
            <DialogTitle className="text-text-primary">
              Bewerk speler
            </DialogTitle>
          </DialogHeader>

          {/* EDIT FORM - hier passen we intern/extern aan */}
          <form onSubmit={handleEdit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type speler */}
              <div>
                <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                  Type speler
                </label>
                <select
                  name="type"
                  value={playerType}
                  onChange={(e) =>
                    setPlayerType(e.target.value as "EXTERNAL" | "INTERNAL")
                  }
                  className="w-full border border-border-dark rounded p-2 bg-background focus:border-accent-primary focus-visible:outline-none"
                >
                  <option value="EXTERNAL">EXTERNAL</option>
                  <option value="INTERNAL">INTERNAL</option>
                </select>
              </div>

              {/* Naam */}
              <div className="md:col-span-2">
                <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                  Naam *
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={player.name}
                  required
                  className="w-full border border-border-dark rounded p-2 bg-background focus:border-accent-primary focus-visible:outline-none"
                />
              </div>

              <PlayerDobAgeFields
                initialDateOfBirth={
                  player.dateOfBirth
                    ? new Date(player.dateOfBirth)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                initialAge={player.age}
              />

              {playerType === "INTERNAL" ? (
                <>
                  {/* INTERN – velden overnemen van NewPlayerModal/EditPlayerModal:
                      teamId, joinedAt, contractEndDate, optionYear, isTopTalent */}
                  {/* Hier kun je exact dezelfde blokken plakken als in NewPlayerModal/EditPlayerModal
                      voor het interne deel. */}
                  {/* Voor nu minimaal: team als tekst + joinedAt/contractEndDate datumvelden */}
                  <div className="md:col-span-2">
                    <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                      Team (intern)
                    </label>
                    <input
                      type="text"
                      name="team"
                      defaultValue={player.team || ""}
                      className="w-full border border-border-dark rounded p-2 bg-background focus:border-accent-primary focus-visible:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                      Bij club sinds
                    </label>
                    <input
                      type="date"
                      name="joinedAt"
                      className="w-full border border-border-dark rounded p-2 bg-background focus:border-accent-primary focus-visible:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                      Contract tot
                    </label>
                    <input
                      type="date"
                      name="contractEndDate"
                      className="w-full border border-border-dark rounded p-2 bg-background focus-border-accent-primary focus-visible:outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* EXTERNAL – huidige club + team + scoutingvelden (zoals nu) */}
                  <div>
                    <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                      Huidige Club
                    </label>
                    <input
                      type="text"
                      name="currentClub"
                      defaultValue={player.currentClub || ""}
                      className="w-full border border-border-dark rounded p-2 bg-background focus:border-accent-primary focus-visible:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                      Team
                    </label>
                    <input
                      type="text"
                      name="team"
                      defaultValue={player.team || ""}
                      className="w-full border border-border-dark rounded p-2 bg-background focus:border-accent-primary focus-visible:outline-none"
                    />
                  </div>
                  {/* positie, nevenpositie, voet, advies, step, status etc. zoals in je huidige PlayerActionsMenu */}
                </>
              )}
            </div>

            {/* Notities + opslaan-knop blijven gelijk */}
            <div>
              <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                Korte Notities
              </label>
              <textarea
                name="notes"
                defaultValue={player.notes || ""}
                className="w-full border border-border-dark rounded p-2 bg-background focus:border-accent-primary focus-visible:outline-none"
                rows={3}
              ></textarea>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" className="btn-premium text-white">
                Opslaan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* De twee andere Dialogs voor taak en contact
          kun je 1-op-1 uit je huidige PlayerActionsMenu overnemen:
          - Dialog openTask / handleTask
          - Dialog openContact / handleContact */}
      {/* ... */}
    </div>
  );
}