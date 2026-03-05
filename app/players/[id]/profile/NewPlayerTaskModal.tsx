"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { TaskForm } from "@/app/tasks/TaskForm";
import { createTask } from "@/app/tasks/actions";

export function NewPlayerTaskModal({
    playerId,
    playerName,
    clubUsers,
  }: {
    playerId: string;
    playerName: string;
    clubUsers: { id: string; name: string }[];
  }) {
    const [open, setOpen] = React.useState(false);

    const handleSubmit = async (fd: FormData) => {
      // speler is hier altijd bekend en gelockt
      fd.set("playerId", playerId);
      await createTask(fd);
      setOpen(false);
    };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="icon"
                    className="p-1.5 bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 rounded-md transition-colors outline-none cursor-pointer focus:ring-accent-primary focus:ring-1 focus:ring-offset-2"
                    aria-label="Nieuwe taak toevoegen"
                    >
                    <Plus className="size-4" />
                </Button>
            </DialogTrigger>
      <DialogContent className="max-w-xl bg-bg-card border-accent-primary text-text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
        <DialogHeader>
          <DialogTitle>Nieuwe taak voor {playerName}</DialogTitle>
        </DialogHeader>
        <TaskForm
          clubUsers={clubUsers}
          initialPlayer={{ id: playerId, name: playerName }}
          lockPlayer={true}
          onSubmit={handleSubmit}
          submitLabel="Opslaan"
        />
      </DialogContent>
    </Dialog>
  );
}