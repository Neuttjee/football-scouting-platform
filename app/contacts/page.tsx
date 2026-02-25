import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';

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
        <Link href="/players" className="btn-premium text-white px-4 py-2 rounded-lg transition text-sm">
          Nieuw Contactmoment
        </Link>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b">
              <tr>
                <th className="p-3 font-medium">Datum</th>
                <th className="p-3 font-medium">Speler</th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium">Kanaal</th>
                <th className="p-3 font-medium">Uitkomst</th>
                <th className="p-3 font-medium">Aangemaakt door</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground italic">
                    Geen contactmomenten gevonden.
                  </td>
                </tr>
              )}
              {contacts.map(c => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString('nl-NL')}
                  </td>
                  <td className="p-3">
                    <Link href={`/players/${c.player.id}/profile`} className="text-accent-primary hover:text-accent-glow font-medium transition-colors">
                      {c.player.name}
                    </Link>
                  </td>
                  <td className="p-3 text-foreground">{c.type}</td>
                  <td className="p-3 text-muted-foreground">{c.channel}</td>
                  <td className="p-3 text-muted-foreground">{c.outcome || '-'}</td>
                  <td className="p-3 text-muted-foreground">{c.createdBy?.name || 'Onbekend'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}