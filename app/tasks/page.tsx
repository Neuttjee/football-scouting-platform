import { getSession, getEffectiveClubId } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { TaskList } from './TaskList';
import { NewTaskModal } from './NewTaskModal';

export default async function TasksPage() {
  const session = await getSession();
  if (!session) return null;

  const clubId = getEffectiveClubId(session);
  if (!clubId) {
    if (session.user.role === 'SUPERADMIN') redirect('/superadmin');
    return null;
  }

  const clubUsers = await prisma.user.findMany({
    where: { clubId, isActive: true }
  });

  const tasks = await prisma.task.findMany({
    where: { clubId },
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
        <NewTaskModal clubUsers={clubUsers} />
      </div>

      <div className="bg-transparent">
        <TaskList tasks={tasks} clubUsers={clubUsers} />
      </div>
    </div>
  );
}
