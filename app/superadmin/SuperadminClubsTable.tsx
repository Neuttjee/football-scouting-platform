'use client';

import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { selectClub, clearSelectedClub } from './actions';

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

export function SuperadminClubsTable({
  rows,
  activeClubId,
}: {
  rows: ClubRow[];
  activeClubId?: string;
}) {
  const router = useRouter();

  const handleSelect = async (clubId: string) => {
    await selectClub(clubId);
    router.refresh();
    router.push('/dashboard');
  };

  const handleClear = async () => {
    await clearSelectedClub();
    router.refresh();
  };

  return (
    <DataTable.Root>
      <DataTable.Header>
        <DataTable.HeaderRow>
          <DataTable.HeaderCell>Club</DataTable.HeaderCell>
          <DataTable.HeaderCell className="text-right">Gebruikers</DataTable.HeaderCell>
          <DataTable.HeaderCell className="text-right">Spelers</DataTable.HeaderCell>
          <DataTable.HeaderCell className="text-right">Aantal logins</DataTable.HeaderCell>
          <DataTable.HeaderCell>Laatste login</DataTable.HeaderCell>
          <DataTable.HeaderCell className="text-right">Acties</DataTable.HeaderCell>
        </DataTable.HeaderRow>
      </DataTable.Header>
      <DataTable.Body>
        {rows.length === 0 ? (
          <DataTable.Empty colSpan={6}>Geen clubs. Klik op &quot;Club toevoegen&quot; om te starten.</DataTable.Empty>
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
              <DataTable.Cell className="text-right">
                {activeClubId === row.id ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    className="text-xs"
                  >
                    Selectie opheffen
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    className="btn-premium text-white text-xs"
                    onClick={() => handleSelect(row.id)}
                  >
                    Bekijk club
                  </Button>
                )}
              </DataTable.Cell>
            </DataTable.Row>
          ))
        )}
      </DataTable.Body>
    </DataTable.Root>
  );
}
