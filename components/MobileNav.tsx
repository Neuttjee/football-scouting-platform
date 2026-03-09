"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, CheckSquare, Settings, ClipboardList, Shield } from 'lucide-react';
import { useHasFeature } from '@/components/club/ClubConfigProvider';
import type { ClubFeatureKey } from '@/lib/clubFeatures';

export function MobileNav({ role }: { role: string }) {
  const pathname = usePathname();
  const hasDashboard = useHasFeature('dashboard');
  const hasInternalPlayers = useHasFeature('internal_players');
  const hasTasks = useHasFeature('tasks');

  const navItems: { href: string; label: string; icon: React.ComponentType<{ size?: number }>; featureKey?: ClubFeatureKey }[] = [
    ...(role === 'SUPERADMIN' ? [{ href: '/superadmin', label: 'Admin', icon: Shield }] : []),
    { href: '/dashboard', label: 'Dash', icon: Home, featureKey: 'dashboard' },
    { href: '/players', label: 'Spelers', icon: Users, featureKey: 'internal_players' },
    { href: '/squad-planning', label: 'Planning', icon: ClipboardList, featureKey: 'internal_players' },
    { href: '/tasks', label: 'Taken', icon: CheckSquare, featureKey: 'tasks' },
  ];

  if (role === 'ADMIN' || role === 'SUPERADMIN') {
    navItems.push({ href: '/settings', label: 'Instellingen', icon: Settings });
  }

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-bg-primary text-text-secondary flex justify-around p-2 border-t border-border-dark z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        if (item.featureKey === 'dashboard' && !hasDashboard) return null;
        if (item.featureKey === 'internal_players' && !hasInternalPlayers) return null;
        if (item.featureKey === 'tasks' && !hasTasks) return null;

        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center p-2 transition-colors ${
              isActive ? 'text-accent-primary' : 'hover:text-text-primary'
            }`}
          >
            <Icon size={20} />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
