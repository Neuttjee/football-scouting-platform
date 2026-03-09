'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/DataTable';
import { Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusPill } from '@/components/StatusPill';
import { ClubStatusModal } from './ClubStatusModal';
import { clearSelectedClub, deleteClub, selectClub, updateClubStatusInteractive } from './actions';

type ClubRow = {
  id: string;
  name: string;
  status: 'ACTIEF' | 'INACTIEF' | 'PROEFPERIODE' | 'GESCHORST';
  trialStartsAt?: string | null;
  trialEndsAt?: string | null;
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

function getStatusLabel(status: ClubRow['status']): string {
  switch (status) {
    case 'ACTIEF':
      return 'Actief';
    case 'INACTIEF':
      return 'Inactief';
    case 'PROEFPERIODE':
      return 'Proefperiode';
    case 'GESCHORST':
      return 'Geschorst';
  }
}

function getStatusTone(status: ClubRow['status']): 'success' | 'danger' | 'warning' | 'neutral' {
  switch (status) {
    case 'ACTIEF':
      return 'success';
    case 'PROEFPERIODE':
      return 'warning';
    case 'INACTIEF':
      return 'danger';
    case 'GESCHORST':
      return 'danger';
  }
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

  const [statusModalOpen, setStatusModalOpen] = React.useState(false);
  const [statusClub, setStatusClub] = React.useState<ClubRow | null>(null);

  const openStatusModal = (club: ClubRow) => {
    setStatusClub(club);
    setStatusModalOpen(true);
  };

  const handleStatusSave = async (payload: any) => {
    if (!statusClub) return;
    try {
      await updateClubStatusInteractive(statusClub.id, payload);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Status wijzigen mislukt.');
    }
  };

  const handleDelete = async (clubId: string, clubName: string) => {
    const ok = confirm(`Weet je zeker dat je "${clubName}" wilt verwijderen? Dit kan niet ongedaan gemaakt worden.`);
    if (!ok) return;

    try {
      await deleteClub(clubId);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Club verwijderen mislukt.');
    }
  };

  return (
    <>
    <DataTable.Root>
      <DataTable.Header>
        <DataTable.HeaderRow>
          <DataTable.HeaderCell>Club</DataTable.HeaderCell>
          <DataTable.HeaderCell className="text-right">Gebruikers</DataTable.HeaderCell>
          <DataTable.HeaderCell className="text-right">Spelers</DataTable.HeaderCell>
          <DataTable.HeaderCell className="text-right">Aantal logins</DataTable.HeaderCell>
          <DataTable.HeaderCell>Laatste login</DataTable.HeaderCell>
          <DataTable.HeaderCell>Status</DataTable.HeaderCell>
          <DataTable.HeaderCell className="text-right">Acties</DataTable.HeaderCell>
        </DataTable.HeaderRow>
      </DataTable.Header>
      <DataTable.Body>
        {rows.length === 0 ? (
          <DataTable.Empty colSpan={7}>Geen clubs. Klik op &quot;Club toevoegen&quot; om te starten.</DataTable.Empty>
        ) : (
          rows.map((row) => (
          <DataTable.Row key={row.id}>
            <DataTable.Cell className="font-medium">
              <button
                type="button"
                onClick={() => router.push(`/superadmin/clubs/${row.id}`)}
                className={
                  activeClubId === row.id
                    ? 'text-[#FF6A00] hover:text-[#ff8533] underline-offset-2 hover:underline cursor-pointer'
                    : 'text-text-primary hover:text-accent-primary underline-offset-2 hover:underline cursor-pointer'
                }
              >
                {row.name}
              </button>
            </DataTable.Cell>
              <DataTable.Cell className="text-right">{row.userCount}</DataTable.Cell>
              <DataTable.Cell className="text-right">{row.playerCount}</DataTable.Cell>
              <DataTable.Cell className="text-right">{row.totalLogins}</DataTable.Cell>
              <DataTable.Cell className="text-muted-foreground">
                {formatLastLogin(row.lastLogin)}
              </DataTable.Cell>
              <DataTable.Cell>
                <StatusPill tone={getStatusTone(row.status)}>
                  {row.status === 'PROEFPERIODE' && row.trialEndsAt
                    ? `Proefperiode (t/m ${new Intl.DateTimeFormat('nl-NL', { dateStyle: 'short' }).format(
                        new Date(row.trialEndsAt)
                      )})`
                    : getStatusLabel(row.status)}
                </StatusPill>
              </DataTable.Cell>
              <DataTable.Cell className="text-right">
                <div className="flex justify-end pr-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-1.5 bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 rounded-md transition-colors outline-none">
                      <Plus className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-bg-card border-border-dark min-w-[200px]">
                      <DropdownMenuItem
                        onClick={() => router.push(`/superadmin/clubs/${row.id}`)}
                        className="cursor-pointer focus:bg-bg-hover focus:text-accent-primary text-text-primary text-xs"
                      >
                        Clubprofiel
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {activeClubId === row.id ? (
                        <DropdownMenuItem
                          onClick={handleClear}
                          className="cursor-pointer focus:bg-bg-hover focus:text-accent-primary text-text-primary text-xs"
                        >
                          Selectie opheffen
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleSelect(row.id)}
                          disabled={row.status === 'INACTIEF' || row.status === 'GESCHORST'}
                          className="cursor-pointer focus:bg-bg-hover focus:text-accent-primary text-text-primary text-xs"
                        >
                          Bekijk club
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => openStatusModal(row)}
                        className="cursor-pointer focus:bg-bg-hover focus:text-accent-primary text-text-primary text-xs"
                      >
                        Status wijzigen
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => handleDelete(row.id, row.name)}
                        className="cursor-pointer focus:bg-bg-hover focus:text-accent-primary text-text-primary text-xs text-destructive"
                      >
                        Club verwijderen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </DataTable.Cell>
            </DataTable.Row>
          ))
        )}
      </DataTable.Body>
    </DataTable.Root>
    <ClubStatusModal
      open={statusModalOpen}
      onOpenChange={setStatusModalOpen}
      club={statusClub}
      onSave={handleStatusSave}
    />
    </>
  );
}
