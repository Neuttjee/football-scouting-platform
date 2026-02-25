"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createTask } from "./actions"

export function NewTaskModal({ clubUsers, players }: { clubUsers: any[], players: any[] }) {
  const [open, setOpen] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await createTask(formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-premium text-white transition">
          Taak Toevoegen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl bg-bg-card border-border-dark text-text-primary">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Nieuwe Taak</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Taak omschrijving *</label>
              <input type="text" name="title" required className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary" placeholder="Bijv. Video bekijken van speler X" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Koppel aan speler</label>
              <select name="playerId" className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary">
                <option value="">Geen speler gekoppeld</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Toewijzen aan (Gebruiker)</label>
              <select name="assignedToId" className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary">
                <option value="">Niet toegewezen</option>
                {clubUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Of toewijzen aan (Externe persoon)</label>
              <input type="text" name="assignedToExternalName" className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary" placeholder="Naam externe persoon" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Deadline</label>
              <input type="date" name="dueDate" className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary" />
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <Button type="submit" className="btn-premium text-white">Taak Toevoegen</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}