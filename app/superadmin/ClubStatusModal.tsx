'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ClubStatusUpdatePayload } from './actions';

type ClubForModal = {
  id: string;
  name: string;
  status: 'ACTIEF' | 'INACTIEF' | 'PROEFPERIODE' | 'GESCHORST';
  trialStartsAt?: string | null;
  trialEndsAt?: string | null;
};

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function daysBetween(aISO: string | null | undefined, bISO: string | null | undefined): number | null {
  if (!aISO || !bISO) return null;
  const a = new Date(aISO).getTime();
  const b = new Date(bISO).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  const days = Math.round((b - a) / (24 * 60 * 60 * 1000));
  return Number.isFinite(days) ? days : null;
}

export function ClubStatusModal({
  open,
  onOpenChange,
  club,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  club: ClubForModal | null;
  onSave: (payload: ClubStatusUpdatePayload) => Promise<void> | void;
}) {
  const [status, setStatus] = React.useState<ClubForModal['status']>('ACTIEF');
  const [trialStartDate, setTrialStartDate] = React.useState<string>('');
  const [trialDurationDays, setTrialDurationDays] = React.useState<number>(14);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (!club) return;
    setStatus(club.status);
    const start = toDateInputValue(club.trialStartsAt) || new Date().toISOString().slice(0, 10);
    setTrialStartDate(start);
    const inferredDays = daysBetween(club.trialStartsAt, club.trialEndsAt);
    setTrialDurationDays(inferredDays ?? 14);
  }, [club, open]);

  const trialEndPreview = React.useMemo(() => {
    if (status !== 'PROEFPERIODE') return null;
    if (!trialStartDate) return null;
    const d = new Date(`${trialStartDate}T00:00:00`);
    if (Number.isNaN(d.getTime())) return null;
    const days = Number(trialDurationDays);
    if (!Number.isFinite(days) || days < 1) return null;
    const end = new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
    return new Intl.DateTimeFormat('nl-NL', { dateStyle: 'short' }).format(end);
  }, [status, trialStartDate, trialDurationDays]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!club) return;

    setPending(true);
    try {
      if (status === 'PROEFPERIODE') {
        const startsAtISO = new Date(`${trialStartDate}T00:00:00`).toISOString();
        const days = Number(trialDurationDays);
        await onSave({
          status: 'PROEFPERIODE',
          trialStartsAtISO: startsAtISO,
          trialDurationDays: days,
        });
      } else {
        await onSave({ status } as ClubStatusUpdatePayload);
      }
      onOpenChange(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-bg-card border-accent-primary text-text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
        <DialogHeader>
          <DialogTitle className="text-text-primary">
            Status wijzigen{club ? ` — ${club.name}` : ''}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
            >
              <option value="PROEFPERIODE">Proefperiode</option>
              <option value="ACTIEF">Actief</option>
              <option value="INACTIEF">Inactief</option>
              <option value="GESCHORST">Geschorst (bijv. betaling)</option>
            </select>
          </div>

          {status === 'PROEFPERIODE' && (
            <div className="space-y-3">
              <div>
                <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                  Startdatum proefperiode
                </label>
                <input
                  type="date"
                  value={trialStartDate}
                  onChange={(e) => setTrialStartDate(e.target.value)}
                  required
                  className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
                />
              </div>

              <div>
                <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                  Duur (dagen)
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={trialDurationDays}
                  onChange={(e) => setTrialDurationDays(Number(e.target.value))}
                  required
                  className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
                />
                {trialEndPreview && (
                  <p className="text-xs text-text-muted mt-2">
                    Wordt automatisch <span className="text-text-primary font-medium">Actief</span> op {trialEndPreview}.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button type="submit" className="btn-premium" disabled={pending || !club}>
              {pending ? 'Opslaan…' : 'Opslaan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

