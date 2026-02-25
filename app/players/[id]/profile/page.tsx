import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EditPlayerModal } from './EditPlayerModal';
import { TaskList } from '@/app/tasks/TaskList';

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

  if (!player) {
    redirect('/players');
  }

  const age = player.dateOfBirth
    ? Math.floor((new Date().getTime() - new Date(player.dateOfBirth).getTime()) / 3.15576e+10)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-2">
        <Link href="/players" className="text-muted-foreground hover:text-foreground transition-colors">
          ← Terug naar spelers
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{player.name}</h1>
        <div className="space-x-2">
          <EditPlayerModal player={player} />
          <Button asChild>
            <Link href={`/players/${player.id}/contacts`}>Contact Toevoegen</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Algemene Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Leeftijd</div>
              <div>{age ? `${age} jaar` : '-'}</div>
              
              <div className="text-muted-foreground">Geboortedatum</div>
              <div>{player.dateOfBirth ? new Date(player.dateOfBirth).toLocaleDateString('nl-NL') : '-'}</div>
              
              <div className="text-muted-foreground">Huidige Club</div>
              <div>{player.currentClub || '-'}</div>

              <div className="text-muted-foreground">Team</div>
              <div>{player.team || '-'}</div>

              <div className="text-muted-foreground">Niveau (Huidig)</div>
              <div>{player.niveau || '-'}</div>

              <div className="text-muted-foreground">Positie</div>
              <div>{player.position || '-'}</div>

              <div className="text-muted-foreground">Nevenpositie</div>
              <div>{player.secondaryPosition || '-'}</div>

              <div className="text-muted-foreground">Voorkeursbeen</div>
              <div>{player.preferredFoot || '-'}</div>

              <div className="text-muted-foreground">Contactpersoon</div>
              <div>{player.contactPerson || '-'}</div>
            </div>
            
            {player.notes && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-muted-foreground text-sm mb-1">Notities</div>
                <div className="text-sm bg-muted/50 p-3 rounded-md">{player.notes}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scouting Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Processtap</div>
              <div className="font-medium">{player.step || '-'}</div>
              
              <div className="text-muted-foreground">Status</div>
              <div className="font-medium flex items-center gap-2">
                {player.status || '-'}
                {player.statusManuallyChanged && (
                  <span className="text-xs text-orange-500" title="Handmatig aangepast">⚠️</span>
                )}
              </div>

              <div className="text-muted-foreground">Advies</div>
              <div className="font-medium">{player.advies || '-'}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Openstaande Taken ({player.tasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {player.tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Geen openstaande taken voor deze speler.</p>
          ) : (
            <TaskList tasks={player.tasks} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contacten Tijdlijn ({player.contacts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {player.contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nog geen contactmomenten geregistreerd.</p>
          ) : (
            <div className="space-y-4">
              {player.contacts.map((contact) => (
                <div key={contact.id} className="border-l-2 border-primary pl-4 pb-4">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium">{contact.type} ({contact.channel})</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(contact.createdAt).toLocaleDateString('nl-NL')}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Door: {contact.createdBy?.name || 'Onbekend'}
                  </div>
                  {contact.outcome && (
                    <div className="text-sm mb-1">
                      <span className="font-medium">Uitkomst:</span> {contact.outcome}
                    </div>
                  )}
                  {contact.reason && (
                    <div className="text-sm mb-1">
                      <span className="font-medium">Reden:</span> {contact.reason}
                    </div>
                  )}
                  {contact.notes && (
                    <div className="text-sm mt-2 bg-muted p-3 rounded-md">
                      {contact.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
