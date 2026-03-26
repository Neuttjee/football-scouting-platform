'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export function LogoutButton({ collapsed = false }: { collapsed?: boolean }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    router.push('/login');
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout}
      className={`w-full ${collapsed ? 'justify-center' : 'text-left pl-3'} p-2 rounded transition-colors text-text-secondary hover:text-primary-brand hover:bg-bg-hover cursor-pointer inline-flex items-center gap-2`}
      title="Uitloggen"
    >
      <LogOut className="h-4 w-4 shrink-0" />
      {!collapsed ? 'Uitloggen' : null}
    </button>
  );
}
