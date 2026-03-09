import { getSession, getEffectiveClubId } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getClubConfigByClubId } from '@/lib/clubConfig';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const clubId = getEffectiveClubId(session);
  if (!clubId) {
    if (session.user.role === 'SUPERADMIN') redirect('/superadmin');
    return null;
  }

  const clubConfig = await getClubConfigByClubId(clubId);

  const [
    totalPlayers,
    internalCount,
    externalCount,
    taskCount,
    myTasks,
    recentContacts,
    externalStatusCounts,
    internalPositionCounts,
  ] = await Promise.all([
    prisma.player.count({ where: { clubId } }),
    prisma.player.count({ where: { clubId, type: 'INTERNAL' } }),
    prisma.player.count({ where: { clubId, type: 'EXTERNAL' } }),
    prisma.task.count({ where: { clubId, isCompleted: false } }),
    prisma.task.findMany({
      where: {
        clubId,
        assignedToId: session.user.id,
        isCompleted: false,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.contactMoment.findMany({
      where: { clubId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        player: { select: { id: true, name: true } },
      },
    }),
    prisma.player.groupBy({
      by: ['status'],
      where: { clubId, type: 'EXTERNAL' },
      _count: { _all: true },
    }),
    prisma.player.groupBy({
      by: ['position'],
      where: { clubId, type: 'INTERNAL' },
      _count: { _all: true },
    }),
  ]);

  const hasTasksFeature = clubConfig?.features.tasks ?? true;
  const hasContactsFeature = clubConfig?.features.contact_logs ?? true;
  const hasInternalPlayersFeature = clubConfig?.features.internal_players ?? true;
  const hasExternalPlayersFeature = clubConfig?.features.external_players ?? true;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium p-6 rounded-xl flex flex-col items-start justify-center transition-all duration-300 hover:border-accent-primary hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]">
          <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider">
            Aantal spelers
          </h2>
          <p className="text-4xl font-bold mt-2 text-text-primary font-mono">{totalPlayers}</p>
        </div>

        {hasExternalPlayersFeature && (
          <div className="card-premium p-6 rounded-xl flex flex-col items-start justify-center transition-all duration-300 hover:border-accent-primary hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]">
            <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Aantal spelers <span className="text-accent-primary">Extern</span>
            </h2>
            <p className="text-4xl font-bold mt-2 text-text-primary font-mono">{externalCount}</p>
          </div>
        )}

        {hasInternalPlayersFeature && (
          <div className="card-premium p-6 rounded-xl flex flex-col items-start justify-center transition-all duration-300 hover:border-accent-primary hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]">
            <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Aantal spelers <span className="text-accent-primary">Intern</span>
            </h2>
            <p className="text-4xl font-bold mt-2 text-text-primary font-mono">{internalCount}</p>
          </div>
        )}
      </div>

      {hasTasksFeature && (
        <div className="card-premium p-6 rounded-xl transition-all duration-300 hover:border-accent-primary hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-text-primary">Mijn open taken</h2>
            <Link
              href="/tasks"
              className="text-sm text-accent-primary hover:text-accent-glow transition-colors"
            >
              Alle taken →
            </Link>
          </div>
          <div className="space-y-3">
            {myTasks.length === 0 && (
              <p className="text-text-muted text-sm">Je hebt geen openstaande taken.</p>
            )}
            {myTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 p-4 bg-bg-secondary rounded-lg border border-border-dark transition-colors hover:border-accent-primary/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--primary-color)' }}
                  ></div>
                  <span className="text-text-primary font-medium">{t.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasContactsFeature && (
        <div className="card-premium p-6 rounded-xl transition-all duration-300 hover:border-accent-primary hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-text-primary">Laatste contactmomenten</h2>
            <Link
              href="/contacts"
              className="text-sm text-accent-primary hover:text-accent-glow transition-colors"
            >
              Alle contacten →
            </Link>
          </div>
          {recentContacts.length === 0 ? (
            <p className="text-text-muted text-sm">Er zijn nog geen contactmomenten geregistreerd.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-text-muted border-b border-border-dark">
                    <th className="py-2 pr-4">Speler</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Kanaal</th>
                    <th className="py-2 pr-4">Uitkomst</th>
                    <th className="py-2 pr-4">Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {recentContacts.map((c) => (
                    <tr key={c.id} className="border-b border-border-dark/60 last:border-b-0">
                      <td className="py-2 pr-4">
                        {c.player ? (
                          <Link
                            href={`/players/${c.player.id}/profile`}
                            className="text-accent-primary hover:text-accent-glow transition-colors"
                          >
                            {c.player.name}
                          </Link>
                        ) : (
                          <span className="text-text-secondary">Onbekend</span>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-text-secondary">{c.type}</td>
                      <td className="py-2 pr-4 text-text-secondary">{c.channel}</td>
                      <td className="py-2 pr-4 text-text-secondary">
                        {c.outcome || c.reason || '-'}
                      </td>
                      <td className="py-2 pr-4 text-text-secondary">
                        {new Date(c.createdAt).toLocaleDateString('nl-NL', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
