"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from './LogoutButton';

interface SidebarProps {
  role: string;
  clubName?: string | null;
  clubLogo?: string | null;
}

export function Sidebar({ role, clubName, clubLogo }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/players', label: 'Spelers' },
    { href: '/tasks', label: 'Taken' },
    { href: '/contacts', label: 'Contacten' },
  ];

  if (role === 'ADMIN') {
    navItems.push({ href: '/settings', label: 'Instellingen' });
  }

  return (
    <aside className="w-48 flex-col hidden md:flex min-h-screen bg-bg-primary border-r border-border-dark">
      <div className="p-4 text-xl font-bold border-b border-border-dark flex items-center gap-3">
        {clubLogo && (
          <img src={clubLogo} alt="Club Logo" className="h-10 w-10 object-contain rounded-md" />
        )}
        <span className="leading-tight text-text-primary text-sm">{clubName || 'Scouting Platform'}</span>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`block p-2 rounded transition-colors ${
                isActive 
                  ? 'text-accent-primary font-medium' 
                  : 'text-text-secondary hover:text-accent-primary'
              }`}
              style={isActive ? { color: 'var(--primary-color)' } : {}}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border-dark">
        <LogoutButton />
      </div>
    </aside>
  );
}
