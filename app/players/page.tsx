import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function PlayersPage() {
  const session = await getSession();
  if (!session) return null;

  const players = await prisma.player.findMany({
    where: { clubId: session.user.clubId },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Spelers</h1>
        <Link href="/players/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Nieuwe Speler
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3 text-sm font-semibold text-gray-700">Naam</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Positie</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Processtap</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Status</th>
              <th className="p-3 text-sm font-semibold text-gray-700 text-right">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {players.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-3 text-sm">{p.name}</td>
                <td className="p-3 text-sm">{p.position || '-'}</td>
                <td className="p-3 text-sm">{p.step || '-'}</td>
                <td className="p-3 text-sm">
                  {p.status || '-'}
                  {p.statusManuallyChanged && (
                    <span className="ml-2 text-xs text-orange-500" title="Handmatig aangepast">⚠️</span>
                  )}
                </td>
                <td className="p-3 text-sm text-right space-x-2">
                  <Link href={`/players/${p.id}`} className="text-blue-600 hover:underline">Bewerk</Link>
                  <Link href={`/players/${p.id}/contacts`} className="text-gray-600 hover:underline">Contacten</Link>
                </td>
              </tr>
            ))}
            {players.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">Geen spelers gevonden.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
