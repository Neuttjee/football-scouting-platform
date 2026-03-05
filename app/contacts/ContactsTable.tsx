'use client';

import Link from 'next/link';
import { DataTable } from '@/components/DataTable';

type ContactRow = {
  id: string;
  createdAt: string;
  type: string;
  channel: string;
  outcome: string | null;
  playerId: string;
  playerName: string;
  createdByName: string | null;
};

export function ContactsTable({ contacts }: { contacts: ContactRow[] }) {
  return (
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
          <DataTable.Empty colSpan={6}>Geen contactmomenten gevonden.</DataTable.Empty>
        ) : (
          contacts.map((c) => (
            <DataTable.Row key={c.id}>
              <DataTable.Cell className="text-muted-foreground">
                {new Date(c.createdAt).toLocaleDateString('nl-NL')}
              </DataTable.Cell>
              <DataTable.Cell>
                <Link
                  href={`/players/${c.playerId}/profile`}
                  className="text-accent-primary hover:text-accent-glow font-medium transition-colors"
                >
                  {c.playerName}
                </Link>
              </DataTable.Cell>
              <DataTable.Cell>{c.type}</DataTable.Cell>
              <DataTable.Cell className="text-muted-foreground">{c.channel}</DataTable.Cell>
              <DataTable.Cell className="text-muted-foreground">{c.outcome || '-'}</DataTable.Cell>
              <DataTable.Cell className="text-muted-foreground">
                {c.createdByName || 'Onbekend'}
              </DataTable.Cell>
            </DataTable.Row>
          ))
        )}
      </DataTable.Body>
    </DataTable.Root>
  );
}
