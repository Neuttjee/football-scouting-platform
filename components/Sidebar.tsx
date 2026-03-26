"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ContactRound,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
} from 'lucide-react';
import { LogoutButton } from './LogoutButton';
import { useHasFeature } from '@/components/club/ClubConfigProvider';
import type { ClubFeatureKey } from '@/lib/clubFeatures';
import { useIsPortraitTablet } from '@/app/squad-planning/useIsPortraitTablet';

interface SidebarProps {
  role: string;
  clubName?: string | null;
  clubLogo?: string | null;
  twoFactorSetupRequired?: boolean;
}

export function Sidebar({ role, clubName, clubLogo, twoFactorSetupRequired = false }: SidebarProps) {
  const pathname = usePathname();
  const isPortraitTablet = useIsPortraitTablet();
  const [collapsed, setCollapsed] = React.useState<boolean | null>(null);
  const hasTasks = useHasFeature('tasks');
  const hasContacts = useHasFeature('contact_logs');
  const hasSquadPlanning = useHasFeature('internal_players'); // selectie planning leunt op interne spelers
  const hasDashboard = useHasFeature('dashboard');
  const COLLAPSE_STORAGE_KEY = 'sidebar-collapsed';

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(COLLAPSE_STORAGE_KEY);
    if (stored === '1') {
      setCollapsed(true);
      return;
    }
    if (stored === '0') {
      setCollapsed(false);
      return;
    }
    setCollapsed(isPortraitTablet);
  }, [isPortraitTablet]);

  React.useEffect(() => {
    if (collapsed == null || typeof window === 'undefined') return;
    window.localStorage.setItem(COLLAPSE_STORAGE_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  const navItems: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; featureKey?: ClubFeatureKey }[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, featureKey: 'dashboard' },
    { href: '/players', label: 'Spelers', icon: Users, featureKey: 'internal_players' },
    { href: '/squad-planning', label: 'Selectie planning', icon: BarChart3, featureKey: 'internal_players' },
    { href: '/tasks', label: 'Taken', icon: ClipboardList, featureKey: 'tasks' },
    { href: '/contacts', label: 'Contacten', icon: ContactRound, featureKey: 'contact_logs' },
  ];

  // Alleen instellingen tonen als er een clubcontext is
  if ((role === 'ADMIN' || role === 'SUPERADMIN') && clubName) {
    navItems.push({ href: '/settings', label: 'Instellingen', icon: Settings });
  }

  const appLogo = clubLogo || '/football-scouting-platform-logo.png';
  const isPlatformLogo = !clubLogo;
  const logoAltText = clubLogo ? 'Club Logo' : 'Football Scouting Platform Logo';
  const isCollapsed = collapsed ?? false;

  return (
    <aside
      className={`${
        isCollapsed ? 'w-14' : 'w-48'
      } flex-col hidden md:flex min-h-screen bg-bg-primary border-r border-border-dark transition-all duration-200`}
    >
      <div className={`p-2 ${isCollapsed ? 'pt-4' : 'pt-8'} flex flex-col items-center gap-3 text-center`}>
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="w-full inline-flex items-center justify-center h-8 rounded-md text-text-secondary hover:text-primary-brand hover:bg-bg-hover"
          aria-label={isCollapsed ? 'Sidebar uitklappen' : 'Sidebar inklappen'}
          title={isCollapsed ? 'Uitklappen' : 'Inklappen'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        {appLogo && (
          <img
            src={appLogo}
            alt={logoAltText}
            className={`${isCollapsed ? 'h-8 w-8' : 'h-24 w-24'} object-contain rounded-md`}
            style={isPlatformLogo ? { filter: 'brightness(0) invert(1)' } : undefined}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        {!isCollapsed ? (
          <span className="leading-tight text-text-primary text-lg font-bold">
            {clubName || 'Football Scouting Platform'}
          </span>
        ) : null}
      </div>
      <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-4'} space-y-2 mt-4`}>
        {twoFactorSetupRequired && (
          isCollapsed ? (
            <p className="text-xs text-text-muted px-1 py-1 text-center" title="Rond eerst je 2FA-setup af om menu-items te openen.">
              2FA
            </p>
          ) : (
            <p className="text-xs text-text-muted px-2 py-1">
              Rond eerst je 2FA-setup af om menu-items te openen.
            </p>
          )
        )}
        {navItems.map((item) => {
          if (twoFactorSetupRequired) return null;
          if (item.featureKey === 'dashboard' && !hasDashboard) return null;
          if (item.featureKey === 'internal_players' && !hasSquadPlanning) return null;
          if (item.featureKey === 'tasks' && !hasTasks) return null;
          if (item.featureKey === 'contact_logs' && !hasContacts) return null;

          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link 
              key={item.href}
              href={item.href} 
              title={item.label}
              className={`relative ${isCollapsed ? 'justify-center' : 'pl-3'} p-2 rounded transition-colors inline-flex items-center gap-2 w-full ${
                isActive 
                  ? 'nav-item-active text-primary-brand font-medium rounded-md'
                  : 'text-text-secondary hover:text-primary-brand hover:bg-bg-hover active:text-primary-brand active:bg-bg-hover focus-visible:text-primary-brand focus-visible:bg-bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/40 rounded-md'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!isCollapsed ? item.label : null}
            </Link>
          );
        })}
      </nav>
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} space-y-2`}>
        {role === 'SUPERADMIN' && !twoFactorSetupRequired && (
          <Link
            href="/superadmin"
            title="Superadmin"
            className={`relative ${isCollapsed ? 'justify-center' : 'pl-3'} p-2 rounded transition-colors inline-flex items-center gap-2 w-full ${
              pathname.startsWith('/superadmin')
                ? 'nav-item-active text-primary-brand font-medium rounded-md'
                : 'text-text-secondary hover:text-primary-brand hover:bg-bg-hover rounded-md'
            }`}
          >
            <Shield className="h-4 w-4 shrink-0" />
            {!isCollapsed ? 'Superadmin' : null}
          </Link>
        )}
        <LogoutButton collapsed={isCollapsed} />
      </div>
    </aside>
  );
}
