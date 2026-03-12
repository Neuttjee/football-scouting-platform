'use client';

import * as React from 'react';
import Link from 'next/link';
import { DataTable } from '@/components/DataTable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ContactForm } from './ContactForm';
import { updateContactFromContactsPage, deleteContact } from './actions';

type ContactRow = {
  id: string;
  createdAt: string;
  type: string;
  channel: string;
  outcome: string | null;
  reason: string | null;
  notes: string | null;
  playerId: string;
  playerName: string;
  createdByName: string | null;
};

export function ContactsTable({ contacts }: { contacts: ContactRow[] }) {
  const [selected, setSelected] = React.useState<ContactRow | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);

  return (
    <>
      <DataTable.Root>
        <DataTable.Header>
          <DataTable.HeaderRow>
            <DataTable.HeaderCell>Datum</DataTable.HeaderCell>
            <DataTable.HeaderCell>Speler</DataTable.HeaderCell>
            <DataTable.HeaderCell>Type</DataTable.HeaderCell>
            <DataTable.HeaderCell>Kanaal</DataTable.HeaderCell>
            <DataTable.HeaderCell>Uitkomst</DataTable.HeaderCell>
            <DataTable.HeaderCell>Aangemaakt door</DataTable.HeaderCell>
          </DataTable.HeaderRow>
        </DataTable.Header>
        <DataTable.Body>
          {contacts.length === 0 ? (
            <DataTable.Empty colSpan={6}>
              Geen contactmomenten gevonden.
            </DataTable.Empty>
          ) : (
            contacts.map((c) => (
              <DataTable.Row
                key={c.id}
                className="cursor-pointer"
                onClick={() => {
                  setSelected(c);
                  setIsEditing(false);
                }}
              >
                <DataTable.Cell className="text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString('nl-NL')}
                </DataTable.Cell>
                <DataTable.Cell>
                  <Link
                    href={`/players/${c.playerId}/profile`}
                    className="text-accent-primary hover:text-accent-glow font-medium transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {c.playerName}
                  </Link>
                </DataTable.Cell>
                <DataTable.Cell>{c.type}</DataTable.Cell>
                <DataTable.Cell className="text-muted-foreground">
                  {c.channel}
                </DataTable.Cell>
                <DataTable.Cell className="text-muted-foreground">
                  {c.outcome || '-'}
                </DataTable.Cell>
                <DataTable.Cell className="text-muted-foreground">
                  {c.createdByName || 'Onbekend'}
                </DataTable.Cell>
              </DataTable.Row>
            ))
          )}
        </DataTable.Body>
      </DataTable.Root>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setIsEditing(false);
          }
        }}
      >
        <DialogContent className="max-w-xl bg-bg-card border-accent-primary text-text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
          <DialogHeader>
            <DialogTitle className="text-text-primary">
              {isEditing ? 'Contactmoment bewerken' : 'Contactmoment'}
            </DialogTitle>
          </DialogHeader>

          {selected && !isEditing && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-text-muted uppercase tracking-wider text-[11px] mb-1">
                    DATUM
                  </div>
                  <div className="font-medium text-text-primary">
                    {new Date(selected.createdAt).toLocaleDateString('nl-NL')}
                  </div>
                </div>
                <div>
                  <div className="text-text-muted uppercase tracking-wider text-[11px] mb-1">
                    TYPE
                  </div>
                  <div className="font-medium text-text-primary">{selected.type}</div>
                </div>
                <div>
                  <div className="text-text-muted uppercase tracking-wider text-[11px] mb-1">
                    KANAAL
                  </div>
                  <div className="font-medium text-text-primary">
                    {selected.channel}
                  </div>
                </div>
                <div>
                  <div className="text-text-muted uppercase tracking-wider text-[11px] mb-1">
                    UITKOMST
                  </div>
                  <div className="font-medium text-text-primary">
                    {selected.outcome || 'Geen of onbekend'}
                  </div>
                </div>
                <div>
                  <div className="text-text-muted uppercase tracking-wider text-[11px] mb-1">
                    SPELER
                  </div>
                  <div className="font-medium text-text-primary">
                    <Link
                      href={`/players/${selected.playerId}/profile`}
                      className="text-accent-primary hover:text-accent-glow underline-offset-2 hover:underline"
                    >
                      {selected.playerName}
                    </Link>
                  </div>
                </div>
                <div>
                  <div className="text-text-muted uppercase tracking-wider text-[11px] mb-1">
                    AANGEMAAKT DOOR
                  </div>
                  <div className="font-medium text-text-primary">
                    {selected.createdByName || 'Onbekend'}
                  </div>
                </div>
              </div>

              {selected.reason && (
                <div className="pt-4 border-t border-border-dark">
                  <div className="text-text-muted uppercase tracking-wider text-[11px] mb-2">
                    REDEN
                  </div>
                  <div className="text-sm bg-bg-secondary/60 border border-border-dark rounded-md p-3 whitespace-pre-wrap text-text-primary">
                    {selected.reason}
                  </div>
                </div>
              )}

              {selected.notes && (
                <div className="pt-4 border-t border-border-dark">
                  <div className="text-text-muted uppercase tracking-wider text-[11px] mb-2">
                    NOTITIES
                  </div>
                  <div className="text-sm bg-bg-secondary/60 border border-border-dark rounded-md p-3 whitespace-pre-wrap text-text-primary">
                    {selected.notes}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-between items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="border-border-dark text-text-secondary hover:text-text-primary"
                  onClick={() => setSelected(null)}
                >
                  Sluiten
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-border-dark text-text-primary hover:border-accent-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Bewerken
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="bg-red-600/90 hover:bg-red-600 text-white"
                    onClick={async () => {
                      if (
                        !window.confirm(
                          'Weet je zeker dat je dit contactmoment wilt verwijderen?',
                        )
                      ) {
                        return;
                      }
                      if (!selected) return;
                      await deleteContact(selected.id);
                      setSelected(null);
                    }}
                  >
                    Verwijderen
                  </Button>
                </div>
              </div>
            </div>
          )}

          {selected && isEditing && (
            <ContactForm
              initialPlayer={{
                id: selected.playerId,
                name: selected.playerName,
              }}
              lockPlayer
              initialValues={{
                type: selected.type,
                channel: selected.channel,
                outcome: selected.outcome,
                reason: selected.reason,
                notes: selected.notes,
              }}
              onSubmit={async (fd) => {
                await updateContactFromContactsPage(selected.id, fd);
                setSelected(null);
                setIsEditing(false);
              }}
              submitLabel="Wijzigingen opslaan"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
