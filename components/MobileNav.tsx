import Link from 'next/link';
import { Home, Users, CheckSquare, Settings } from 'lucide-react';

export function MobileNav({ role }: { role: string }) {
  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-slate-900 text-white flex justify-around p-2 border-t border-slate-800 z-50">
      <Link href="/dashboard" className="flex flex-col items-center p-2">
        <Home size={20} />
        <span className="text-xs mt-1">Dash</span>
      </Link>
      <Link href="/players" className="flex flex-col items-center p-2">
        <Users size={20} />
        <span className="text-xs mt-1">Spelers</span>
      </Link>
      <Link href="/tasks" className="flex flex-col items-center p-2">
        <CheckSquare size={20} />
        <span className="text-xs mt-1">Taken</span>
      </Link>
      {role === 'ADMIN' && (
        <Link href="/settings" className="flex flex-col items-center p-2">
          <Settings size={20} />
          <span className="text-xs mt-1">Instellingen</span>
        </Link>
      )}
    </nav>
  );
}
