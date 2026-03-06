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
import { PlayerForm } from "@/app/players/PlayerForm";
import { TaskForm } from "@/app/tasks/TaskForm";
import { ContactForm } from "@/app/contacts/ContactForm";

export interface PlayerForActions {
  id: string;
  name: string;
  type: "INTERNAL" | "EXTERNAL";
  position: string | null;
  currentClub: string | null;
  team: string | null;
  niveau: string | null;
  secondaryPosition: string | null;
  preferredFoot: string | null;
  dateOfBirth: Date | null;
  age: number | null;
  step: string | null;
  status: string | null;
  advies: string | null;
  notes: string | null;
}

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

    const handleEditSubmit = async (fd: FormData) => {
      await updatePlayer(player.id, fd);
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
        <DialogContent
          className="max-w-2xl max-h-[85vh] overflow-y-auto bg-bg-card border-accent-primary text-text-primary"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-text-primary">
              Bewerk speler
            </DialogTitle>
          </DialogHeader>

          <PlayerForm
            mode="edit"
            initialValues={{
              id: player.id,
              name: player.name,
              type: player.type,
              dateOfBirth: player.dateOfBirth,
              age: player.age,
              currentClub: player.currentClub,
              team: player.team,
              teamId: null,
              joinedAt: null,
              contractEndDate: null,
              distanceFromClubKm: null,
              isTopTalent: false,
              niveau: player.niveau ?? null,
              position: player.position,
              secondaryPosition: player.secondaryPosition,
              favoritePosition: null,
              preferredFoot: player.preferredFoot,
              contactPerson: null,
              status: player.status,
              step: player.step,
              advies: player.advies,
              notes: player.notes,
            }}
            teams={[]}
            clubName={clubName}
            onSubmit={handleEditSubmit}
          />
        </DialogContent>
      </Dialog>

      {/* Nieuwe taak vanuit tabel, met speler gelocked */}
      <Dialog open={openTask} onOpenChange={setOpenTask}>
        <DialogContent className="max-w-xl bg-bg-card border-accent-primary text-text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
          <DialogHeader>
            <DialogTitle>Nieuwe taak voor {player.name}</DialogTitle>
          </DialogHeader>
          <TaskForm
            clubUsers={clubUsers}
            initialPlayer={{ id: player.id, name: player.name }}
            lockPlayer={true}
            onSubmit={async (fd) => {
              fd.set("playerId", player.id);
              await createTask(fd);
              setOpenTask(false);
              router.refresh();
            }}
            submitLabel="Opslaan"
          />
        </DialogContent>
      </Dialog>

      {/* Nieuw contactmoment vanuit tabel, met speler gelocked */}
      <Dialog open={openContact} onOpenChange={setOpenContact}>
        <DialogContent className="max-w-md bg-bg-card border-accent-primary text-text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
          <DialogHeader>
            <DialogTitle>Nieuw contactmoment</DialogTitle>
          </DialogHeader>
          <ContactForm
            initialPlayer={{ id: player.id, name: player.name }}
            lockPlayer={true}
            onSubmit={async (fd) => {
              fd.set("playerId", player.id);
              await createContact(player.id, fd);
              setOpenContact(false);
              router.refresh();
            }}
            submitLabel="Opslaan"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}