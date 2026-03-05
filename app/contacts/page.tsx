import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { NewContactModal } from './NewContactModal';
import { DataTable } from '@/components/DataTable';

export default async function ContactsPage() {
  const session = await getSession();
  if (!session) return null;

  const contacts = await prisma.contactMoment.findMany({
    where: { clubId: session.user.clubId },
    orderBy: { createdAt: 'desc' },
    include: {
      player: { select: { id: true, name: true } },
      createdBy: { select: { name: true } }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contactmomenten</h1>
        <NewContactModal />
      </div>

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
                  <Link href={`/players/${c.player.id}/profile`} className="text-accent-primary hover:text-accent-glow font-medium transition-colors">
                    {c.player.name}
                  </Link>
                </DataTable.Cell>
                <DataTable.Cell>{c.type}</DataTable.Cell>
                <DataTable.Cell className="text-muted-foreground">{c.channel}</DataTable.Cell>
                <DataTable.Cell className="text-muted-foreground">{c.outcome || '-'}</DataTable.Cell>
                <DataTable.Cell className="text-muted-foreground">{c.createdBy?.name || 'Onbekend'}</DataTable.Cell>
              </DataTable.Row>
            ))
          )}
        </DataTable.Body>
      </DataTable.Root>
    </div>
  );
}