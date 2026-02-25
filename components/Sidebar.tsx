import Link from 'next/link';
import { LogoutButton } from './LogoutButton';

interface SidebarProps {
  role: string;
  clubName?: string | null;
  clubLogo?: string | null;
}

export function Sidebar({ role, clubName, clubLogo }: SidebarProps) {
  return (
    <aside 
      className="w-64 text-white flex-col hidden md:flex min-h-screen"
      style={{ backgroundColor: 'var(--primary-color)' }}
    >
      <div 
        className="p-4 text-xl font-bold border-b border-white/10 flex items-center gap-3" 
      >
        {clubLogo && (
          <img src={clubLogo} alt="Club Logo" className="h-16 w-16 object-contain bg-white rounded-md p-1" />
        )}
        <span className="leading-tight">{clubName || 'Scouting Platform'}</span>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link href="/dashboard" className="block p-2 rounded hover:bg-white/10 transition-colors">Dashboard</Link>
        <Link href="/players" className="block p-2 rounded hover:bg-white/10 transition-colors">Spelers</Link>
        <Link href="/tasks" className="block p-2 rounded hover:bg-white/10 transition-colors">Taken</Link>
        <Link href="/contacts" className="block p-2 rounded hover:bg-white/10 transition-colors">Contacten</Link>
        {role === 'ADMIN' && (
          <Link href="/settings" className="block p-2 rounded hover:bg-white/10 transition-colors">Instellingen</Link>
        )}
      </nav>
      <div className="p-4 border-t border-white/10">
        <LogoutButton />
      </div>
    </aside>
  );
}
