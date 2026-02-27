import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EditPlayerModal } from './EditPlayerModal';
import { NewContactModal } from './NewContactModal';
import { NewPlayerTaskModal } from './NewPlayerTaskModal';
import { TaskList } from '@/app/tasks/TaskList';
import { PlayerRadarChart } from "./PlayerRadarChart";

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { id } = await params;

  const player = await prisma.player.findUnique({
    where: { id, clubId: session.user.clubId },
    include: {
      contacts: {
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { name: true } }
        }
      },
      tasks: {
        where: { isCompleted: false },
        orderBy: { createdAt: 'desc' },
        include: { assignedTo: true, createdBy: true, player: true }
      }
    }
  });

  const clubUsers = await prisma.user.findMany({
    where: { clubId: session.user.clubId },
    select: { id: true, name: true },
  });

  if (!player) {
    redirect('/players');
  }

  const age = player.dateOfBirth
    ? Math.floor((new Date().getTime() - new Date(player.dateOfBirth).getTime()) / 3.15576e+10)
    : null;

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4 mb-2">
        <Link href="/players" className="text-text-muted hover:text-text-primary transition-colors text-sm uppercase tracking-wider font-medium">
          ← Terug
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 card-premium p-6 rounded-xl">
        <div>
          <h1 className="text-4xl font-bold text-text-primary mb-1">{player.name}</h1>
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <span>{player.currentClub || 'Geen club'}</span>
            <span className="w-1 h-1 rounded-full bg-border-dark"></span>
            <span>{player.position || 'Geen positie'}</span>
            {age && (
              <>
                <span className="w-1 h-1 rounded-full bg-border-dark"></span>
                <span className="font-mono">{age} jaar</span>
              </>
            )}
          </div>
        </div>
        <div className="flex space-x-3">
          <EditPlayerModal player={player} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-accent-primary uppercase tracking-widest text-xs">Algemene Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
                <div>
                  <div className="text-text-muted uppercase tracking-wider text-xs mb-1">Club (Huidig)</div>
                  <div className="font-medium text-text-primary">{player.currentClub || '-'}</div>
                </div>
                <div>
                  <div className="text-text-muted uppercase tracking-wider text-xs mb-1">Team (Huidig)</div>
                  <div className="font-medium text-text-primary">{player.team || '-'}</div>
                </div>
                <div>
                  <div className="text-text-muted uppercase tracking-wider text-xs mb-1">Niveau (Huidig)</div>
                  <div className="font-medium text-text-primary">{player.niveau || '-'}</div>
                </div>
                <div>
                  <div className="text-text-muted uppercase tracking-wider text-xs mb-1">Geboortedatum</div>
                  <div className="font-medium text-text-primary font-mono">{player.dateOfBirth ? new Date(player.dateOfBirth).toLocaleDateString('nl-NL') : '-'}</div>
                </div>
                <div>
                  <div className="text-text-muted uppercase tracking-wider text-xs mb-1">Positie</div>
                  <div className="font-medium text-text-primary">{player.position || '-'}</div>
                </div>
                <div>
                  <div className="text-text-muted uppercase tracking-wider text-xs mb-1">Nevenpositie</div>
                  <div className="font-medium text-text-primary">{player.secondaryPosition || '-'}</div>
                </div>
                <div>
                  <div className="text-text-muted uppercase tracking-wider text-xs mb-1">Voorkeursbeen</div>
                  <div className="font-medium text-text-primary">{player.preferredFoot || '-'}</div>
                </div>
                <div>
                  <div className="text-text-muted uppercase tracking-wider text-xs mb-1">Contactpersoon</div>
                  <div className="font-medium text-text-primary">{player.contactPerson || '-'}</div>
                </div>
              </div>
              
              {player.notes && (
                <div className="mt-6 pt-6 border-t border-border-dark">
                  <div className="text-text-muted uppercase tracking-wider text-xs mb-2">Notities</div>
                  <div className="text-sm bg-bg-secondary p-4 rounded-lg border border-border-dark text-text-secondary leading-relaxed">{player.notes}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-accent-primary uppercase tracking-widest text-xs">
                  Openstaande Taken ({player.tasks.length})
                </CardTitle>
                <NewPlayerTaskModal
                  playerId={player.id}
                  playerName={player.name}
                  clubUsers={clubUsers} 
                />
              </div>
            </CardHeader>
            <CardContent>
              {player.tasks.length === 0 ? (
                <p className="text-sm text-text-muted">
                  Geen openstaande taken voor deze speler.
                </p>
              ) : (
                <TaskList tasks={player.tasks} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-accent-primary uppercase tracking-widest text-xs">
                  Contacten Tijdlijn ({player.contacts.length})
                </CardTitle>
                <NewContactModal playerId={player.id} />
              </div>
            </CardHeader>
            <CardContent>
              {player.contacts.length === 0 ? (
                <p className="text-sm text-text-muted">Nog geen contactmomenten geregistreerd.</p>
              ) : (
                <div className="space-y-6">
                  {player.contacts.map((contact) => (
                    <div key={contact.id} className="border-l-2 border-accent-primary/50 pl-5 pb-2 relative">
                      <div className="absolute w-3 h-3 bg-accent-primary rounded-full -left-[7px] top-1 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-text-primary">{contact.type} <span className="text-text-muted font-normal">({contact.channel})</span></div>
                        <div className="text-xs text-text-muted font-mono">
                          {new Date(contact.createdAt).toLocaleDateString('nl-NL')}
                        </div>
                      </div>
                      <div className="text-sm text-text-secondary mb-3">
                        Door: <span className="text-text-primary">{contact.createdBy?.name || 'Onbekend'}</span>
                      </div>
                      <div className="bg-bg-secondary p-4 rounded-lg border border-border-dark space-y-2">
                        {contact.outcome && (
                          <div className="text-sm">
                            <span className="text-text-muted uppercase tracking-wider text-xs mr-2">Uitkomst:</span> <span className="text-text-primary">{contact.outcome}</span>
                          </div>
                        )}
                        {contact.reason && (
                          <div className="text-sm">
                            <span className="text-text-muted uppercase tracking-wider text-xs mr-2">Reden:</span> <span className="text-text-primary">{contact.reason}</span>
                          </div>
                        )}
                        {contact.notes && (
                          <div className="text-sm mt-3 pt-3 border-t border-border-dark text-text-secondary">
                            {contact.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-accent-primary/30 border-dashed shadow-[0_0_30px_rgba(var(--primary-rgb),0.05)]">
            <CardHeader>
              <CardTitle className="text-accent-primary uppercase tracking-widest text-xs">Scouting Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div>
                <div className="text-text-muted uppercase tracking-wider text-xs mb-1">Status</div>
                <div className="font-bold text-lg flex items-center gap-2 text-text-primary"></div>
              </div>

              <div>
                <div className="text-text-muted uppercase tracking-wider text-xs mb-1">Processtap</div>
                <div className="font-bold text-lg text-text-primary">{player.step || '-'}</div>
              </div>

              <div>
                <div className="text-text-muted uppercase tracking-wider text-xs mb-1">Advies</div>
                <div className="font-bold text-lg text-text-primary">{player.advies || '-'}</div>
              </div>
            </CardContent>
          </Card>

          {/* Placeholder for future Radar Chart */}
          <Card className="border-accent-primary/30 shadow-[0_0_30px_rgba(var(--primary-rgb),0.05)]">
            <CardHeader>
              <CardTitle className="text-accent-primary uppercase tracking-widest text-xs">
                Radar Chart (Binnenkort)
              </CardTitle>
            </CardHeader>
          <CardContent className="h-64">
              <PlayerRadarChart />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
