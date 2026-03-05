import { getSession, getEffectiveClubId } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { NewContactModal } from './NewContactModal';
import { ContactsTable } from './ContactsTable';

export default async function ContactsPage() {
  const session = await getSession();
  if (!session) return null;

  const clubId = getEffectiveClubId(session);
  if (!clubId) {
    if (session.user.role === 'SUPERADMIN') redirect('/superadmin');
    return null;
  }

  const contacts = await prisma.contactMoment.findMany({
    where: { clubId },
    orderBy: { createdAt: 'desc' },
    include: {
      player: { select: { id: true, name: true } },
      createdBy: { select: { name: true } }
    }
  });

  const rows = contacts.map((c) => ({
    id: c.id,
    createdAt: c.createdAt.toISOString(),
    type: c.type,
    channel: c.channel,
    outcome: c.outcome,
    playerId: c.player.id,
    playerName: c.player.name,
    createdByName: c.createdBy?.name ?? null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contactmomenten</h1>
        <NewContactModal />
      </div>
      <ContactsTable contacts={rows} />
    </div>
  );
}