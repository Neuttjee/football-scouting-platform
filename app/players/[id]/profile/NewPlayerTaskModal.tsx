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
    const [assigneeType, setAssigneeType] = React.useState<"none" | "user" | "external">("none");
    const [selectedUserId, setSelectedUserId] = React.useState<string>("");
    const [externalName, setExternalName] = React.useState<string>("");
  
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      formData.append("playerId", playerId);
  
      if (assigneeType === "user" && selectedUserId) {
        formData.append("assignedToId", selectedUserId);
      } else if (assigneeType === "external" && externalName.trim()) {
        formData.append("assignedToExternalName", externalName.trim());
      }
  
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
          <DialogTitle>Nieuwe taak voor {playerName}</DialogTitle>
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

            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium mb-1 text-text-secondary">
                Toewijzen aan
              </label>
              <select
                className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary"
                value={
                  assigneeType === "user"
                    ? selectedUserId || ""
                    : assigneeType === "external"
                    ? "external"
                    : "none"
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "none") {
                    setAssigneeType("none");
                    setSelectedUserId("");
                    setExternalName("");
                  } else if (val === "external") {
                    setAssigneeType("external");
                    setSelectedUserId("");
                  } else {
                    setAssigneeType("user");
                    setSelectedUserId(val);
                    setExternalName("");
                  }
                }}
              >
                <option value="none">Niet toegewezen</option>
                {clubUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
                <option value="external">Ander (naam typen)</option>
              </select>

              {assigneeType === "external" && (
                <input
                  type="text"
                  placeholder="Naam externe persoon"
                  className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary"
                  value={externalName}
                  onChange={(e) => setExternalName(e.target.value)}
                />
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}