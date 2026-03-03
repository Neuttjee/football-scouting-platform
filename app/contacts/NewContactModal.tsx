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
import { createContactFromContactsPage } from "./actions";

type PlayerOption = { id: string; name: string };

export function NewContactModal({ players }: { players: PlayerOption[] }) {
  const [open, setOpen] = React.useState(false);
  const [outcome, setOutcome] = React.useState("");
  const requiresReason = outcome === "Afgehaakt" || outcome === "Niet haalbaar";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createContactFromContactsPage(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-premium text-white px-4 py-2 rounded-lg transition text-sm">
          Nieuw contactmoment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-bg-card border-accent-primary text-text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Nieuw contactmoment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
              Speler *
            </label>
            <select
              name="playerId"
              required
              className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
            >
              <option value="">Selecteer speler...</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
              Type *
            </label>
            <select
              name="type"
              required
              className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
            >
              <option value="">Selecteer...</option>
              {["Intro benadering", "Follow up", "Gesprek", "Meetraining", "Aanbod", "Overig"].map(
                (t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
              Kanaal *
            </label>
            <select
              name="channel"
              required
              className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
            >
              <option value="">Selecteer...</option>
              {["Whatsapp", "Telefoon", "Op de club", "Training", "Via derde", "E-mail", "Overig"].map(
                (t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ),
              )}
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
              className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
            >
              <option value="">Geen of onbekend</option>
              {["Positief", "Neutraal", "Twijfel", "Negatief", "Afgehaakt", "Niet haalbaar"].map(
                (t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ),
              )}
            </select>
          </div>

          {requiresReason && (
            <div>
              <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                Reden (verplicht bij Afgehaakt / Niet haalbaar) *
              </label>
              <input
                type="text"
                name="reason"
                required={requiresReason}
                className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
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
              className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" className="btn-premium text-white">
              Opslaan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}