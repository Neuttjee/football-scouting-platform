import Link from 'next/link';
import { LogoutButton } from './LogoutButton';

interface SidebarProps {
  role: string;
  clubName?: string | null;
}

export function Sidebar({ role, clubName }: SidebarProps) {
  return (
    <aside className="w-64 bg-slate-900 text-white flex-col hidden md:flex min-h-screen">
      <div 
        className="p-4 text-xl font-bold border-b border-slate-800" 
        style={{ color: 'var(--primary-color)' }}
      >
        {clubName || 'Scouting Platform'}
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link href="/dashboard" className="block p-2 rounded hover:bg-slate-800 transition-colors">Dashboard</Link>
        <Link href="/players" className="block p-2 rounded hover:bg-slate-800 transition-colors">Spelers</Link>
        <Link href="/tasks" className="block p-2 rounded hover:bg-slate-800 transition-colors">Taken</Link>
        {role === 'ADMIN' && (
          <Link href="/settings" className="block p-2 rounded hover:bg-slate-800 transition-colors">Instellingen</Link>
        )}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <LogoutButton />
      </div>
    </aside>
  );
}
