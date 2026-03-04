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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updatePlayer } from "@/app/players/actions";
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

  const [playerType, setPlayerType] = React.useState<"EXTERNAL" | "INTERNAL">(
    player.type === "INTERNAL" ? "INTERNAL" : "EXTERNAL"
  );

  const currentClubLabel =
    playerType === "INTERNAL"
      ? clubName || player.currentClub || ""
      : player.currentClub || "";

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("type", playerType);
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
      {/* Plus-knop met menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="p-1.5 bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 rounded-md transition-colors outline-none">
          <Plus className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-bg-card border-border-dark min-w-[160px]"
        >
          <DropdownMenuItem
            onClick={() => setOpenEdit(true)}
            className="cursor-pointer focus:bg-bg-hover focus:text-accent-primary text-text-primary text-xs"
          >
            Bewerken
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setOpenTask(true)}
            className="cursor-pointer focus:bg-bg-hover focus:text-accent-primary text-text-primary text-xs"
          >
            Nieuwe taak
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setOpenContact(true)}
            className="cursor-pointer focus:bg-bg-hover focus:text-accent-primary text-text-primary text-xs"
          >
            Nieuw contactmoment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Bewerk speler */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-bg-card border-accent-primary text-text-primary">
          <DialogHeader>
            <DialogTitle className="text-text-primary">
              Bewerk speler
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEdit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type speler + Top speler */}
              <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="block text-text-muted uppercase tracking-wider text-xs">
                    Type speler
                  </span>
                  <select
                    name="type"
                    value={playerType}
                    onChange={(e) =>
                      setPlayerType(e.target.value as "EXTERNAL" | "INTERNAL")
                    }
                    className="w-40 border border-border-dark rounded p-2 bg-background focus:border-accent-primary focus-visible:outline-none"
                  >
                    <option value="EXTERNAL">Extern</option>
                    <option value="INTERNAL">Intern</option>
                  </select>
                </div>
                {playerType === "INTERNAL" && (
                  <label className="flex items-center gap-2 text-sm text-text-secondary">
                    <input type="checkbox" name="isTopTalent" />
                    Top speler
                  </label>
                )}
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
                    ? new Date(player.dateOfBirth).toISOString().split("T")[0]
                    : ""
                }
                initialAge={player.age}
              />

              {/* Huidige club + team */}
              <div>
                <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                  Huidige Club
                </label>
                <input
                  type="text"
                  name="currentClub"
                  value={currentClubLabel}
                  readOnly={playerType === "INTERNAL"}
                  className="w-full border border-border-dark rounded p-2 bg-background text-text-primary focus:border-accent-primary focus-visible:outline-none disabled:opacity-75"
                />
                {playerType === "INTERNAL" && (
                  <input
                    type="hidden"
                    name="currentClub"
                    value={currentClubLabel}
                  />
                )}
              </div>
              <div>
                <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                  Team
                </label>
                <input
                  type="text"
                  name="team"
                  defaultValue={player.team || ""}
                  className="w-full border border-border-dark rounded p-2 bg-background focus-border-accent-primary focus-visible:outline-none"
                />
              </div>

              {/* Scoutingvelden extern – je huidige layout kun je hier laten of uitbreiden */}
            </div>

            <div>
              <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                Korte Notities
              </label>
              <textarea
                name="notes"
                defaultValue={player.notes || ""}
                className="w-full border border-border-dark rounded p-2 bg-background focus-border-accent-primary focus-visible:outline-none"
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

      {/* Nieuwe taak */}
      <Dialog open={openTask} onOpenChange={setOpenTask}>
        <DialogContent className="max-w-xl bg-bg-card border-accent-primary text-text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
          <DialogHeader>
            <DialogTitle>Nieuwe taak voor {player.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTask} className="space-y-4 py-4">
            <div className="space-y-4">
              <div>
                <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                  Taak omschrijving *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
                />
              </div>
              <div>
                <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                  Toewijzen (Gebruiker)
                </label>
                <select
                  name="assignedToId"
                  className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
                >
                  <option value="">Niet toegewezen</option>
                  {clubUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                  Toewijzen (Extern)
                </label>
                <input
                  type="text"
                  name="assignedToExternalName"
                  className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-border-accent-primary focus-visible:outline-none"
                />
              </div>
              <div>
                <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  name="dueDate"
                  className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-border-accent-primary focus-visible:outline-none"
                />
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <Button type="submit" className="btn-premium text-white">
                Opslaan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Nieuw contactmoment */}
      <Dialog open={openContact} onOpenChange={setOpenContact}>
        <DialogContent className="max-w-md bg-bg-card border-accent-primary text-text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
          <DialogHeader>
            <DialogTitle>Nieuw contactmoment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleContact} className="space-y-4 py-4">
            <div>
              <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                Type *
              </label>
              <select
                name="type"
                required
                className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-border-accent-primary focus-visible:outline-none"
              >
                <option value="">Selecteer...</option>
                {[
                  "Intro benadering",
                  "Follow up",
                  "Gesprek",
                  "Meetraining",
                  "Aanbod",
                  "Overig",
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                Kanaal *
              </label>
              <select
                name="channel"
                required
                className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-border-accent-primary focus-visible:outline-none"
              >
                <option value="">Selecteer...</option>
                {[
                  "Whatsapp",
                  "Telefoon",
                  "Op de club",
                  "Training",
                  "Via derde",
                  "E-mail",
                  "Overig",
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                Uitkomst
              </label>
              <select
                name="outcome"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-border-accent-primary focus-visible:outline-none"
              >
                <option value="">Geen of onbekend</option>
                {[
                  "Positief",
                  "Neutraal",
                  "Twijfel",
                  "Negatief",
                  "Afgehaakt",
                  "Niet haalbaar",
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            {requiresReason && (
              <div>
                <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                  Reden (Verplicht bij Afgehaakt/Niet haalbaar) *
                </label>
                <input
                  type="text"
                  name="reason"
                  required={requiresReason}
                  className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-border-accent-primary focus-visible:outline-none"
                />
              </div>
            )}
            <div>
              <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                Notities
              </label>
              <textarea
                name="notes"
                rows={3}
                className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-border-accent-primary focus-visible:outline-none"
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
    </div>
  );
}