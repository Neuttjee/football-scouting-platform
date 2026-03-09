"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from './LogoutButton';
import { useHasFeature } from '@/components/club/ClubConfigProvider';
import type { ClubFeatureKey } from '@/lib/clubFeatures';

interface SidebarProps {
  role: string;
  clubName?: string | null;
  clubLogo?: string | null;
}

export function Sidebar({ role, clubName, clubLogo }: SidebarProps) {
  const pathname = usePathname();
  const hasTasks = useHasFeature('tasks');
  const hasContacts = useHasFeature('contact_logs');
  const hasSquadPlanning = useHasFeature('internal_players'); // selectie planning leunt op interne spelers
  const hasDashboard = useHasFeature('dashboard');

  const navItems: { href: string; label: string; featureKey?: ClubFeatureKey }[] = [
    { href: '/dashboard', label: 'Dashboard', featureKey: 'dashboard' },
    { href: '/players', label: 'Spelers', featureKey: 'internal_players' },
    { href: '/squad-planning', label: 'Selectie planning', featureKey: 'internal_players' },
    { href: '/tasks', label: 'Taken', featureKey: 'tasks' },
    { href: '/contacts', label: 'Contacten', featureKey: 'contact_logs' },
  ];

  if (role === 'ADMIN' || role === 'SUPERADMIN') {
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
          if (item.featureKey === 'dashboard' && !hasDashboard) return null;
          if (item.featureKey === 'internal_players' && !hasSquadPlanning) return null;
          if (item.featureKey === 'tasks' && !hasTasks) return null;
          if (item.featureKey === 'contact_logs' && !hasContacts) return null;

          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`relative block pl-3 p-2 rounded transition-colors ${
                isActive 
                  ? 'nav-item-active text-primary-brand font-medium rounded-md'
                  : 'text-text-secondary hover:text-primary-brand hover:bg-bg-hover rounded-md'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 space-y-2">
        {role === 'SUPERADMIN' && (
          <Link
            href="/superadmin"
            className={`relative block pl-3 p-2 rounded transition-colors ${
              pathname.startsWith('/superadmin')
                ? 'nav-item-active text-primary-brand font-medium rounded-md'
                : 'text-text-secondary hover:text-primary-brand hover:bg-bg-hover rounded-md'
            }`}
          >
            Superadmin
          </Link>
        )}
        <LogoutButton />
      </div>
    </aside>
  );
}
