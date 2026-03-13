import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

type SearchParams = {
  from?: string;
  to?: string;
  action?: string;
  clubId?: string;
  actorId?: string;
};

export default async function SuperadminAuditLogsPage(props: { searchParams: SearchParams }) {
  const session = await getSession();
  if (!session || session.user.role !== 'SUPERADMIN') {
    redirect('/dashboard');
  }

  const { from, to, action, clubId, actorId } = props.searchParams || {};

  const where: any = {};

  if (from || to) {
    where.createdAt = {};
    if (from) {
      const fromDate = new Date(from);
      if (!Number.isNaN(fromDate.getTime())) {
        where.createdAt.gte = fromDate;
      }
    }
    if (to) {
      const toDate = new Date(to);
      if (!Number.isNaN(toDate.getTime())) {
        where.createdAt.lte = toDate;
      }
    }
  }

  if (action) {
    where.action = action;
  }
  if (clubId) {
    where.clubId = clubId;
  }
  if (actorId) {
    where.actorId = actorId;
  }

  const [logs, clubs, actors, actions] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        actor: { select: { id: true, name: true, email: true } },
        club: { select: { id: true, name: true } },
      },
    }),
    prisma.club.findMany({
      where: { name: { not: 'Platform' } },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.user.findMany({
      where: {},
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true },
      take: 200,
    }),
    prisma.auditLog.findMany({
      distinct: ['action'],
      select: { action: true },
      orderBy: { action: 'asc' },
    }),
  ]);

  const actionOptions = actions.map((a) => a.action).filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Audit logs</h1>
        <p className="text-sm text-muted-foreground">
          Overzicht van belangrijke beheer- en beveiligingsacties binnen het platform. Alleen zichtbaar voor SUPERADMIN.
        </p>
      </div>

      <form className="grid gap-4 md:grid-cols-4 lg:grid-cols-5 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Vanaf datum</label>
          <input
            type="date"
            name="from"
            defaultValue={from ?? ''}
            className="border border-border-dark rounded px-2 py-1 text-sm bg-bg-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Tot en met datum</label>
          <input
            type="date"
            name="to"
            defaultValue={to ?? ''}
            className="border border-border-dark rounded px-2 py-1 text-sm bg-bg-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Club</label>
          <select
            name="clubId"
            defaultValue={clubId ?? ''}
            className="border border-border-dark rounded px-2 py-1 text-sm bg-bg-primary"
          >
            <option value="">Alle clubs</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Gebruiker</label>
          <select
            name="actorId"
            defaultValue={actorId ?? ''}
            className="border border-border-dark rounded px-2 py-1 text-sm bg-bg-primary"
          >
            <option value="">Alle gebruikers</option>
            {actors.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Actietype</label>
          <select
            name="action"
            defaultValue={action ?? ''}
            className="border border-border-dark rounded px-2 py-1 text-sm bg-bg-primary"
          >
            <option value="">Alle acties</option>
            {actionOptions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-4 lg:col-span-5 flex gap-2 justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded text-sm bg-bg-secondary text-text-secondary border border-border-dark"
          >
            Filters toepassen
          </button>
        </div>
      </form>

      <div className="border border-border-dark rounded-lg overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-bg-secondary border-b border-border-dark">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">Datum</th>
              <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">Actie</th>
              <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">Gebruiker</th>
              <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">Club</th>
              <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">Object</th>
              <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center text-sm text-muted-foreground">
                  Geen audit logs gevonden voor de huidige filters.
                </td>
              </tr>
            )}
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-border-dark hover:bg-bg-secondary/40">
                <td className="px-3 py-2 align-top whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString('nl-NL')}
                </td>
                <td className="px-3 py-2 align-top">
                  <span className="inline-flex items-center rounded-full border border-border-dark px-2 py-0.5 text-xs">
                    {log.action}
                  </span>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {log.actorRole ?? ''}
                  </div>
                </td>
                <td className="px-3 py-2 align-top">
                  {log.actor ? (
                    <>
                      <div>{log.actor.name}</div>
                      <div className="text-xs text-muted-foreground">{log.actor.email}</div>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">Onbekend</span>
                  )}
                </td>
                <td className="px-3 py-2 align-top">
                  {log.club ? (
                    <div>{log.club.name}</div>
                  ) : (
                    <span className="text-xs text-muted-foreground">n.v.t.</span>
                  )}
                </td>
                <td className="px-3 py-2 align-top">
                  <div>{log.entityType}</div>
                  {log.entityId && (
                    <div className="text-xs text-muted-foreground">ID: {log.entityId}</div>
                  )}
                </td>
                <td className="px-3 py-2 align-top">
                  {log.metadata ? (
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all max-h-32 overflow-auto bg-bg-secondary/40 rounded p-2">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

