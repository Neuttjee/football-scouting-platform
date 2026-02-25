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
      <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-premium p-6 rounded-xl flex flex-col items-start justify-center transition-all duration-300 hover:border-accent-primary hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]">
          <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider">Aantal Spelers</h2>
          <p className="text-4xl font-bold mt-2 text-text-primary font-mono">{playerCount}</p>
        </div>
        
        <div className="card-premium p-6 rounded-xl flex flex-col items-start justify-center transition-all duration-300 hover:border-accent-primary hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]">
          <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider">Open Taken (Club)</h2>
          <p className="text-4xl font-bold mt-2 text-text-primary font-mono">{taskCount}</p>
        </div>
      </div>

      <div className="card-premium p-6 rounded-xl transition-all duration-300 hover:border-accent-primary hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-text-primary">Mijn Open Taken</h2>
          <Link href="/tasks" className="text-sm text-accent-primary hover:text-accent-glow transition-colors">Alle taken →</Link>
        </div>
        <div className="space-y-3">
          {myTasks.length === 0 && (
            <p className="text-text-muted text-sm">Je hebt geen openstaande taken.</p>
          )}
          {myTasks.map(t => (
            <div key={t.id} className="flex items-center space-x-3 p-4 bg-bg-secondary rounded-lg border border-border-dark transition-colors hover:border-accent-primary/50">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary-color)' }}></div>
              <span className="text-text-primary font-medium">{t.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
