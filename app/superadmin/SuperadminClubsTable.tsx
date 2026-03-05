'use client';

import { DataTable } from '@/components/DataTable';

type ClubRow = {
  id: string;
  name: string;
  userCount: number;
  playerCount: number;
  totalLogins: number;
  lastLogin: string | null;
};

function formatLastLogin(isoDate: string | null): string {
  if (!isoDate) return '—';
  return new Intl.DateTimeFormat('nl-NL', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(isoDate));
}

export function SuperadminClubsTable({ rows }: { rows: ClubRow[] }) {
  return (
    <DataTable.Root>
      <DataTable.Header>
        <DataTable.HeaderRow>
          <DataTable.HeaderCell>Club</DataTable.HeaderCell>
          <DataTable.HeaderCell className="text-right">Gebruikers</DataTable.HeaderCell>
          <DataTable.HeaderCell className="text-right">Spelers</DataTable.HeaderCell>
          <DataTable.HeaderCell className="text-right">Aantal logins</DataTable.HeaderCell>
          <DataTable.HeaderCell>Laatste login</DataTable.HeaderCell>
        </DataTable.HeaderRow>
      </DataTable.Header>
      <DataTable.Body>
        {rows.length === 0 ? (
          <DataTable.Empty colSpan={5}>Geen clubs gevonden.</DataTable.Empty>
        ) : (
          rows.map((row) => (
            <DataTable.Row key={row.id}>
              <DataTable.Cell className="font-medium">{row.name}</DataTable.Cell>
              <DataTable.Cell className="text-right">{row.userCount}</DataTable.Cell>
              <DataTable.Cell className="text-right">{row.playerCount}</DataTable.Cell>
              <DataTable.Cell className="text-right">{row.totalLogins}</DataTable.Cell>
              <DataTable.Cell className="text-muted-foreground">
                {formatLastLogin(row.lastLogin)}
              </DataTable.Cell>
            </DataTable.Row>
          ))
        )}
      </DataTable.Body>
    </DataTable.Root>
  );
}
