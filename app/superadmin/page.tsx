import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { SuperadminClubsTable } from './SuperadminClubsTable';

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
      lastLogin: lastLogin ? lastLogin.toISOString() : null,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Superadmin – Clubs</h1>
        <p className="text-muted-foreground mt-1">
          Overzicht van alle clubs. Switch naar een club om huisstijl in te stellen via Instellingen.
        </p>
      </div>
      <SuperadminClubsTable rows={rows} />
    </div>
  );
}
