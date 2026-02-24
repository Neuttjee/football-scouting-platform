import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ContactForm } from './ContactForm';

export default async function PlayerContactsPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return null;

  const player = await prisma.player.findUnique({
    where: { id: params.id, clubId: session.user.clubId },
    include: {
      contacts: {
        orderBy: { createdAt: 'desc' },
        include: { createdBy: true }
      }
    }
  });

  if (!player) return notFound();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/players" className="text-gray-500 hover:text-gray-900">← Terug</Link>
        <h1 className="text-3xl font-bold">Contactmomenten: {player.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ContactForm playerId={player.id} />
        </div>

        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold mb-4">Historie</h2>
          {player.contacts.map(c => (
            <div key={c.id} className="bg-white p-4 rounded-lg shadow space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-gray-900">{c.type}</span>
                  <span className="text-gray-500 text-sm ml-2">via {c.channel}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(c.createdAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              
              {c.outcome && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Uitkomst: </span>
                  <span className="text-sm text-gray-900">{c.outcome}</span>
                </div>
              )}
              {c.reason && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Reden: </span>
                  <span className="text-sm text-gray-900">{c.reason}</span>
                </div>
              )}
              {c.notes && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Notities: </span>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{c.notes}</p>
                </div>
              )}
              <div className="text-xs text-gray-400 mt-2">
                Ingevoerd door: {c.createdBy?.name || 'Onbekend'}
              </div>
            </div>
          ))}
          {player.contacts.length === 0 && (
            <p className="text-gray-500 italic bg-white p-4 rounded shadow">Nog geen contactmomenten geregistreerd.</p>
          )}
        </div>
      </div>
    </div>
  );
}
