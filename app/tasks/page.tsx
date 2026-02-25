import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { TaskList } from './TaskList';
import { NewTaskModal } from './NewTaskModal';

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Taken</h1>
        <NewTaskModal clubUsers={clubUsers} players={players} />
      </div>

      <div className="bg-transparent">
        <TaskList tasks={tasks} />
      </div>
    </div>
  );
}
