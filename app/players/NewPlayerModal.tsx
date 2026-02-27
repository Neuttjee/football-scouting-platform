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
import { createPlayer } from "./actions"
import { targetSteps, targetStatuses, adviesOptions } from "@/lib/statusMapping"

export function NewPlayerModal() {
  const [open, setOpen] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await createPlayer(formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-premium text-white transition">
          Nieuwe Speler
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-bg-card border-accent-primary text-text-primary">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Nieuwe Speler Toevoegen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Naam *</label>
              <input type="text" name="name" required className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Geboortedatum</label>
              <input type="date" name="dateOfBirth" className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Huidige Club</label>
              <input type="text" name="currentClub" className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Team</label>
              <input type="text" name="team" className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Niveau (Huidig)</label>
              <input type="text" name="niveau" className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Positie</label>
              <input type="text" name="position" className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Nevenpositie</label>
              <input type="text" name="secondaryPosition" className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Voorkeursbeen</label>
              <select name="preferredFoot" className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary">
                <option value="">Selecteer been...</option>
                <option value="Rechts">Rechts</option>
                <option value="Links">Links</option>
                <option value="Tweebenig">Tweebenig</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Contactpersoon</label>
              <input type="text" name="contactPerson" className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary" />
            </div>

            {/* Status eerst */}
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">
              Status
              </label>
            <select
            name="status"
            className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary"
            >
            <option value="">Selecteer status...</option>
            {targetStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

            {/* Dan processtap */}
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">
                Processtap
              </label>
              <select
                name="step"
                className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary"
              >
                <option value="">Selecteer processtap...</option>
                {targetSteps.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Dan advies, nu als lijst */}
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">
                Advies
              </label>
              <select
                name="advies"
                className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary"
              >
                <option value="">Selecteer advies...</option>
                {adviesOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">Korte Notities</label>
            <textarea name="notes" className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary" rows={3}></textarea>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" className="btn-premium text-white">Opslaan</Button>
          </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}