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

  const tasks = await prisma.task.findMany({
    where: { clubId: session.user.clubId },
    orderBy: [
      { isCompleted: 'asc' },
      { createdAt: 'desc' }
    ],
    include: { assignedTo: true, createdBy: true }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Taken</h1>

      <form action={createTask} className="bg-white p-6 rounded-lg shadow flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium mb-1">Taak omschrijving *</label>
          <input type="text" name="title" required className="w-full border rounded p-2" placeholder="Bijv. Video bekijken van speler X" />
        </div>
        <div className="w-full md:w-64">
          <label className="block text-sm font-medium mb-1">Toewijzen aan</label>
          <select name="assignedToId" className="w-full border rounded p-2">
            <option value="">Niet toegewezen</option>
            {clubUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <button type="submit" className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
          Toevoegen
        </button>
      </form>

      <div className="bg-transparent">
        <TaskList tasks={tasks} />
      </div>
    </div>
  );
}
