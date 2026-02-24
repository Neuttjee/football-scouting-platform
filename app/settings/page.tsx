import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { updateClubBranding } from './actions';
import { UserTable } from './UserTable';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const club = await prisma.club.findUnique({ where: { id: session.user.clubId } });
  const users = await prisma.user.findMany({ where: { clubId: session.user.clubId } });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Instellingen</h1>
      
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Club Branding</h2>
        <form action={updateClubBranding} className="space-y-4 max-w-sm">
          <div>
            <label className="block text-sm font-medium mb-1">Primaire Kleur</label>
            <div className="flex gap-4 items-center">
              <input type="color" name="primaryColor" defaultValue={club?.primaryColor || '#3b82f6'} className="h-10 w-20 border rounded cursor-pointer" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Secundaire Kleur</label>
            <div className="flex gap-4 items-center">
              <input type="color" name="secondaryColor" defaultValue={club?.secondaryColor || '#1e40af'} className="h-10 w-20 border rounded cursor-pointer" />
            </div>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Opslaan</button>
        </form>
      </section>

      <section className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Gebruikersbeheer</h2>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Gebruiker Uitnodigen</button>
        </div>
        <UserTable users={users} currentUserId={session.user.id} />
      </section>

      <section className="bg-white p-6 rounded-lg shadow opacity-60">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          Two-Factor Authentication (2FA) 
          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Post MVP</span>
        </h2>
        <p className="text-sm text-gray-600 mb-4">De architectuur is voorbereid voor TOTP 2FA (bv. Google Authenticator). Deze functionaliteit wordt in een latere fase geactiveerd.</p>
        <button disabled className="bg-gray-300 text-gray-500 px-4 py-2 rounded cursor-not-allowed">2FA Inschakelen</button>
      </section>
    </div>
  );
}
