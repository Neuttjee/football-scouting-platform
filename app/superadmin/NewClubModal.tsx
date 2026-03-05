'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createClub } from './actions';

export function NewClubModal() {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    try {
      const form = e.currentTarget;
      await createClub(new FormData(form));
      setOpen(false);
      form.reset();
    } catch (err) {
      console.error(err);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-premium text-white px-4 py-2 rounded-lg transition text-sm">
          Club toevoegen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-bg-card border-accent-primary text-text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Nieuwe club</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
              Clubnaam
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
              placeholder="Bijv. SV Hillegom"
            />
          </div>
          <div>
            <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
              Huisstijlkleur (optioneel)
            </label>
            <input
              type="text"
              name="primaryColor"
              className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
              placeholder="#FF6A00"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuleren
            </Button>
            <Button type="submit" className="btn-premium" disabled={pending}>
              {pending ? 'Bezig…' : 'Club toevoegen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
