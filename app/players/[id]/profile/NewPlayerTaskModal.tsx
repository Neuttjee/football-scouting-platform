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
import { createTask } from "@/app/tasks/actions";
import { Plus } from "lucide-react";

export function NewPlayerTaskModal({ playerId, playerName }: { playerId: string; playerName: string }) {
  const [open, setOpen] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("playerId", playerId);
    await createTask(formData);
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
          <DialogTitle>Nieuwe Taak voor {playerName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">
                Taak omschrijving *
              </label>
              <input
                type="text"
                name="title"
                required
                className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">
                Deadline
              </label>
              <input
                type="date"
                name="dueDate"
                className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">
              Beschrijving
            </label>
            <textarea
              name="description"
              rows={3}
              className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary"
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" className="btn-premium text-white">
              Taak toevoegen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}