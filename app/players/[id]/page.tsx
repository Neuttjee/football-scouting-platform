import { updatePlayer } from '../actions';
import { targetSteps, targetStatuses } from '@/lib/statusMapping';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { notFound } from 'next/navigation';

export default async function EditPlayerPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return null;

  const player = await prisma.player.findUnique({
    where: { id: params.id, clubId: session.user.clubId }
  });

  if (!player) return notFound();

  const updatePlayerWithId = updatePlayer.bind(null, player.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/players" className="text-gray-500 hover:text-gray-900">← Terug</Link>
        <h1 className="text-3xl font-bold">Bewerk Speler</h1>
      </div>

      <form action={updatePlayerWithId} className="bg-white p-6 rounded-lg shadow space-y-4">
        
        <div>
          <label className="block text-sm font-medium mb-1">Naam *</label>
          <input type="text" name="name" defaultValue={player.name} required className="w-full border rounded p-2" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Positie</label>
          <input type="text" name="position" defaultValue={player.position || ''} className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Geboortedatum</label>
          <input type="date" name="dateOfBirth" defaultValue={player.dateOfBirth ? player.dateOfBirth.toISOString().split('T')[0] : ''} className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Processtap</label>
          <select name="step" defaultValue={player.step || ''} className="w-full border rounded p-2">
            <option value="">Selecteer processtap...</option>
            {targetSteps.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status (Override)</label>
          <select name="status" defaultValue={player.statusManuallyChanged ? (player.status || '') : ''} className="w-full border rounded p-2 text-gray-600">
            <option value="">Automatisch bepalen via processtap</option>
            {targetStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <p className="text-xs text-gray-500 mt-1">Laat leeg om status automatisch te laten bepalen op basis van de processtap. Huidige status: {player.status || 'Geen'}</p>
        </div>

        <div className="pt-4 flex justify-end">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Opslaan</button>
        </div>
      </form>
    </div>
  );
}
