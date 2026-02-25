import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createTask } from './actions';
import { TaskList } from './TaskList';

export default async function TasksPage() {
  const session = await getSession();
  if (!session) return null;

  const clubUsers = await prisma.user.findMany({
    where: { clubId: session.user.clubId, isActive: true }
  });

  const players = await prisma.player.findMany({
    where: { clubId: session.user.clubId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  });

  const tasks = await prisma.task.findMany({
    where: { clubId: session.user.clubId },
    orderBy: [
      { isCompleted: 'asc' },
      { createdAt: 'desc' }
    ],
    include: { assignedTo: true, createdBy: true, player: true }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Taken</h1>

      <form action={createTask} className="bg-card p-6 rounded-lg shadow-sm border flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Taak omschrijving *</label>
            <input type="text" name="title" required className="w-full border rounded p-2 bg-background" placeholder="Bijv. Video bekijken van speler X" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Koppel aan speler</label>
            <select name="playerId" className="w-full border rounded p-2 bg-background">
              <option value="">Geen speler gekoppeld</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Toewijzen aan (Gebruiker)</label>
            <select name="assignedToId" className="w-full border rounded p-2 bg-background">
              <option value="">Niet toegewezen</option>
              {clubUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Of toewijzen aan (Externe persoon)</label>
            <input type="text" name="assignedToExternalName" className="w-full border rounded p-2 bg-background" placeholder="Naam externe persoon" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Deadline</label>
            <input type="date" name="dueDate" className="w-full border rounded p-2 bg-background" />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="w-full md:w-auto bg-accent-primary text-white px-6 py-2 rounded hover:bg-accent-glow transition">
            Taak Toevoegen
          </button>
        </div>
      </form>

      <div className="bg-transparent">
        <TaskList tasks={tasks} />
      </div>
    </div>
  );
}
