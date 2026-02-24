'use client';

import { toggleUserStatus } from './actions';
import { useTransition } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
};

export function UserTable({ users, currentUserId }: { users: User[], currentUserId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (userId: string, isActive: boolean) => {
    startTransition(() => {
      toggleUserStatus(userId, !isActive);
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="p-3 text-sm font-semibold text-gray-700">Naam</th>
            <th className="p-3 text-sm font-semibold text-gray-700">Email</th>
            <th className="p-3 text-sm font-semibold text-gray-700">Rol</th>
            <th className="p-3 text-sm font-semibold text-gray-700">Status</th>
            <th className="p-3 text-sm font-semibold text-gray-700 text-right">Acties</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map(u => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="p-3 text-sm">{u.name}</td>
              <td className="p-3 text-sm">{u.email}</td>
              <td className="p-3 text-sm">{u.role}</td>
              <td className="p-3 text-sm">
                <span className={`px-2 py-1 rounded text-xs ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {u.isActive ? 'Actief' : 'Inactief'}
                </span>
              </td>
              <td className="p-3 text-sm text-right">
                {u.id !== currentUserId && (
                  <button 
                    onClick={() => handleToggle(u.id, u.isActive)}
                    disabled={isPending}
                    className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    {u.isActive ? 'Deactiveren' : 'Activeren'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
