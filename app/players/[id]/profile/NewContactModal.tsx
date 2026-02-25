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
import { createContact } from "../contacts/actions"

export function NewContactModal({ playerId }: { playerId: string }) {
  const [open, setOpen] = React.useState(false)
  const [outcome, setOutcome] = React.useState('')
  const requiresReason = outcome === 'Afgehaakt' || outcome === 'Niet haalbaar'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await createContact(playerId, formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-premium text-white transition-all">
          Contact Toevoegen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-bg-card border-border-dark text-text-primary">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Nieuw Contactmoment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">Type *</label>
            <select name="type" required className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary">
              <option value="">Selecteer...</option>
              {['Intro benadering', 'Follow up', 'Gesprek', 'Meetraining', 'Aanbod', 'Overig'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">Kanaal *</label>
            <select name="channel" required className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary">
              <option value="">Selecteer...</option>
              {['Whatsapp', 'Telefoon', 'Op de club', 'Training', 'Via derde', 'E-mail', 'Overig'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">Uitkomst</label>
            <select name="outcome" value={outcome} onChange={e => setOutcome(e.target.value)} className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary">
              <option value="">Geen of onbekend</option>
              {['Positief', 'Neutraal', 'Twijfel', 'Negatief', 'Afgehaakt', 'Niet haalbaar'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {requiresReason && (
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Reden (Verplicht bij Afgehaakt/Niet haalbaar) *</label>
              <input type="text" name="reason" required={requiresReason} className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">Notities</label>
            <textarea name="notes" rows={3} className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary"></textarea>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" className="btn-premium text-white">Toevoegen</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}