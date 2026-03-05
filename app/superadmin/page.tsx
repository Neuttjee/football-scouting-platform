import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { DataTable } from '@/components/DataTable';

export default async function SuperadminPage() {
  const session = await getSession();
  if (!session || session.user.role !== 'SUPERADMIN') {
    redirect('/dashboard');
  }

  const clubs = await prisma.club.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { users: true, players: true } },
      users: { select: { loginCount: true, lastLoginAt: true } },
    },
  });

  const rows = clubs.map((club) => {
    const totalLogins = club.users.reduce((sum, u) => sum + u.loginCount, 0);
    const lastLogin = club.users.reduce<Date | null>((max, u) => {
      if (!u.lastLoginAt) return max;
      return !max || u.lastLoginAt > max ? u.lastLoginAt : max;
    }, null);
    return {
      id: club.id,
      name: club.name,
      userCount: club._count.users,
      playerCount: club._count.players,
      totalLogins,
      lastLogin,
    };
  });

  function formatLastLogin(date: Date | null): string {
    if (!date) return '—';
    return new Intl.DateTimeFormat('nl-NL', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Superadmin – Clubs</h1>
        <p className="text-muted-foreground mt-1">
          Overzicht van alle clubs. Switch naar een club om huisstijl in te stellen via Instellingen.
        </p>
      </div>

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
    </div>
  );
}
