import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { UserTable } from './UserTable';
import { BrandingForm } from './BrandingForm';
import { InviteUserModal } from './InviteUserModal';
import { TeamSettingsForm } from './TeamSettingsForm';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const [club, users, teams] = await Promise.all([
    prisma.club.findUnique({ where: { id: session.user.clubId } }),
    prisma.user.findMany({ where: { clubId: session.user.clubId } }),
    prisma.team.findMany({
      where: { clubId: session.user.clubId },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Instellingen</h1>
      </div>
      
      <section className="card-premium p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Club Branding</h2>
        <BrandingForm club={club} />
      </section>

      <section className="card-premium p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Planning Instellingen</h2>
        <TeamSettingsForm teams={teams} agingThreshold={club?.agingThreshold ?? 30} />
      </section>

      <section className="card-premium p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Gebruikersbeheer</h2>
          <InviteUserModal />
        </div>
        <UserTable users={users} currentUserId={session.user.id} />
      </section>

      <section className="bg-card p-6 rounded-lg shadow border opacity-60">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          Two-Factor Authentication (2FA) 
          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Post MVP</span>
        </h2>
        <p className="text-sm text-muted-foreground mb-4">De architectuur is voorbereid voor TOTP 2FA (bv. Google Authenticator). Deze functionaliteit wordt in een latere fase geactiveerd.</p>
        <button disabled className="bg-muted text-muted-foreground px-4 py-2 rounded cursor-not-allowed">2FA Inschakelen</button>
      </section>

      <section className="bg-card p-6 rounded-lg shadow border opacity-60">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          Spelers importeren
          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Post MVP</span>
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Importeer spelerslijsten vanuit Excel of CSV om externe scoutinglijsten of je eigen selectie snel in het platform te zetten.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="bg-muted text-muted-foreground px-4 py-2 rounded cursor-not-allowed text-sm"
            disabled
          >
            Import starten
          </button>

          <button
            type="button"
            className="bg-muted text-muted-foreground px-4 py-2 rounded cursor-not-allowed text-sm"
            disabled
          >
            Voorbeeldbestand downloaden
          </button>

          <span className="text-xs text-muted-foreground">
            Functionaliteit wordt binnenkort geactiveerd.
          </span>
        </div>
      </section>
    </div>
  );
}
