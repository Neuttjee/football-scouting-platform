import { getSession, getEffectiveClubId } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { UserTable } from './UserTable';
import { BrandingForm } from './BrandingForm';
import { InviteUserModal } from './InviteUserModal';
import { ImportPlayersCard } from './ImportPlayersCard';
import { getClubConfigByClubId } from '@/lib/clubConfig';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const clubId = getEffectiveClubId(session);
  if (!clubId) redirect('/superadmin');

  const [club, users, clubConfig] = await Promise.all([
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
        twoFactorEnabled: true,
        twoFactorVerifiedAt: true,
        twoFactorResetAt: true,
      },
    }),
    getClubConfigByClubId(clubId),
  ]);

  const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPERADMIN';
  const hasTwoFactorModule = clubConfig?.features.two_factor_auth ?? false;

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
            <UserTable
              users={users}
              currentUserId={session.user.id}
              hasTwoFactorModule={hasTwoFactorModule}
              canManageTwoFactor={isAdmin && hasTwoFactorModule}
            />
          </section>
        </>
      )}
      <ImportPlayersCard canImport={isAdmin} />
    </div>
  );
}
