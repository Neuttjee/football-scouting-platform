import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { PlayersTable } from './PlayersTable';
import { NewPlayerModal } from './NewPlayerModal';

export default async function PlayersPage() {
  const session = await getSession();
  if (!session) return null;

  const [players, clubUsers, activeTeams] = await Promise.all([
    prisma.player.findMany({
      where: { clubId: session.user.clubId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        position: true,
        step: true,
        status: true,
        currentClub: true,
        team: true,
        secondaryPosition: true,
        preferredFoot: true,
        dateOfBirth: true,
        age: true,
        type: true,
        advies: true,
        notes: true,
      },
    }),
    prisma.user.findMany({
      where: { clubId: session.user.clubId },
      select: { id: true, name: true }
    }),
    prisma.team.findMany({
      where: { clubId: session.user.clubId, isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, name: true, code: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Spelers</h1>
        <NewPlayerModal teams={activeTeams} />
      </div>

      <PlayersTable data={players} clubUsers={clubUsers} />
    </div>
  );
}
