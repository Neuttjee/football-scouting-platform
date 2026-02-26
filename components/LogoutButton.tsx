'use client';

import { useRouter } from 'next/navigation';

export function LogoutButton() {
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
      className="w-full text-left p-2 rounded transition-colors text-text-secondary hover:text-text-primary"
    >
      Uitloggen
    </button>
  );
}
