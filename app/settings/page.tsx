import { getSession, getEffectiveClubId } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { UserTable } from './UserTable';
import { BrandingForm } from './BrandingForm';
import { InviteUserModal } from './InviteUserModal';
import { ImportPlayersCard } from './ImportPlayersCard';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const clubId = getEffectiveClubId(session);
  if (!clubId) redirect('/superadmin');

  const [club, users] = await Promise.all([
    prisma.club.findUnique({ where: { id: clubId } }),
    prisma.user.findMany({
      where: { clubId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        passwordHash: true,
        inviteToken: true,
        inviteTokenExpires: true,
        lastLoginAt: true,
      },
    }),
  ]);

  const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPERADMIN';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Instellingen</h1>
      </div>
      
      {isAdmin && (
        <>
          <section className="card-premium p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Club Branding</h2>
            <BrandingForm club={club} />
          </section>

          <section className="card-premium p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Gebruikersbeheer</h2>
              <InviteUserModal />
            </div>
            <UserTable users={users} currentUserId={session.user.id} />
          </section>
        </>
      )}

      <section className="bg-card p-6 rounded-lg shadow border opacity-60">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          Two-Factor Authentication (2FA) 
          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Post MVP</span>
        </h2>
        <p className="text-sm text-muted-foreground mb-4">De architectuur is voorbereid voor TOTP 2FA (bv. Google Authenticator). Deze functionaliteit wordt in een latere fase geactiveerd.</p>
        <button disabled className="bg-muted text-muted-foreground px-4 py-2 rounded cursor-not-allowed">2FA Inschakelen</button>
      </section>

      <ImportPlayersCard canImport={isAdmin} />
    </div>
  );
}
