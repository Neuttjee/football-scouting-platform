import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { PlayersTable } from './PlayersTable';

export default async function PlayersPage() {
  const session = await getSession();
  if (!session) return null;

  const players = await prisma.player.findMany({
    where: { clubId: session.user.clubId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      position: true,
      step: true,
      status: true,
      statusManuallyChanged: true,
      currentClub: true,
      team: true,
      secondaryPosition: true,
      preferredFoot: true,
      dateOfBirth: true,
      advies: true,
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Spelers</h1>
        <Link href="/players/new" className="bg-accent-primary text-white px-4 py-2 rounded hover:bg-accent-glow transition">
          Nieuwe Speler
        </Link>
      </div>

      <PlayersTable data={players} />
    </div>
  );
}
