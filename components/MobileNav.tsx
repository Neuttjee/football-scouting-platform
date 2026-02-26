"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, CheckSquare, Settings } from 'lucide-react';

export function MobileNav({ role }: { role: string }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dash', icon: Home },
    { href: '/players', label: 'Spelers', icon: Users },
    { href: '/tasks', label: 'Taken', icon: CheckSquare },
  ];

  if (role === 'ADMIN') {
    navItems.push({ href: '/settings', label: 'Instellingen', icon: Settings });
  }

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-bg-primary text-text-secondary flex justify-around p-2 border-t border-border-dark z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
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
