import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { SuperadminClubsTable } from './SuperadminClubsTable';
import { NewClubModal } from './NewClubModal';

export default async function SuperadminPage() {
  const session = await getSession();
  if (!session || session.user.role !== 'SUPERADMIN') {
    redirect('/dashboard');
  }

  // Auto-promote clubs when trial ends
  await prisma.club.updateMany({
    where: {
      status: 'PROEFPERIODE' as any,
      trialEndsAt: { lte: new Date() } as any,
    } as any,
    data: {
      status: 'ACTIEF' as any,
      trialStartsAt: null,
      trialEndsAt: null,
      billingStatus: 'ACTIVE' as any,
    } as any,
  });

  const clubs = await prisma.club.findMany({
    where: { name: { not: 'Platform' } },
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
      status: (club as any).status ?? 'ACTIEF',
      trialStartsAt: (club as any).trialStartsAt ? (club as any).trialStartsAt.toISOString() : null,
      trialEndsAt: (club as any).trialEndsAt ? (club as any).trialEndsAt.toISOString() : null,
      userCount: club._count.users,
      playerCount: club._count.players,
      totalLogins,
      lastLogin: lastLogin ? lastLogin.toISOString() : null,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Clubs</h1>
        </div>
        <NewClubModal />
      </div>
      <SuperadminClubsTable rows={rows} activeClubId={session.activeClubId} />
    </div>
  );
}
