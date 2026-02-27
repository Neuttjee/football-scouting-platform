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
      <div className="p-4 pt-8 flex flex-col items-center gap-4 text-center">
        {clubLogo && (
          <img src={clubLogo} alt="Club Logo" className="h-24 w-24 object-contain rounded-md" />
        )}
        <span className="leading-tight text-text-primary text-lg font-bold">{clubName || 'Scouting Platform'}</span>
      </div>
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`relative block pl-3 p-2 rounded transition-colors ${
                isActive 
                  ? 'nav-item-active text-primary-brand font-medium bg-bg-hover rounded-md'
                  : 'text-text-secondary hover:text-primary-brand hover:bg-bg-hover rounded-md'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4">
        <LogoutButton />
      </div>
    </aside>
  );
}
