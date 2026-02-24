import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const [playerCount, taskCount, myTasks] = await Promise.all([
    prisma.player.count({ where: { clubId: session.user.clubId } }),
    prisma.task.count({ where: { clubId: session.user.clubId, isCompleted: false } }),
    prisma.task.findMany({ 
      where: { 
        clubId: session.user.clubId, 
        assignedToId: session.user.id,
        isCompleted: false
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100 flex flex-col items-center justify-center">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Aantal Spelers</h2>
          <p className="text-5xl font-bold mt-2 text-blue-600">{playerCount}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100 flex flex-col items-center justify-center">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Open Taken (Club)</h2>
          <p className="text-5xl font-bold mt-2 text-green-600">{taskCount}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Mijn Open Taken</h2>
          <Link href="/tasks" className="text-sm text-blue-600 hover:underline">Alle taken →</Link>
        </div>
        <div className="space-y-3">
          {myTasks.length === 0 && (
            <p className="text-gray-500 text-sm">Je hebt geen openstaande taken.</p>
          )}
          {myTasks.map(t => (
            <div key={t.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded border border-gray-100">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-800 font-medium">{t.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
