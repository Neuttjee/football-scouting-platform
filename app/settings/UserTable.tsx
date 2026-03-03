'use client';

import { toggleUserStatus } from './actions';
import { useTransition } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
    <div className="rounded-xl card-premium overflow-hidden shadow-lg">
      <div className="overflow-x-auto pb-4">
        <Table className="min-w-max">
          <TableHeader className="bg-bg-secondary">
            <TableRow className="border-border-dark hover:bg-transparent">
              <TableHead className="align-top py-2 px-2 text-text-secondary">
                <div className="font-semibold uppercase tracking-wider text-xs">
                  Naam
                </div>
              </TableHead>
              <TableHead className="align-top py-2 px-2 text-text-secondary">
                <div className="font-semibold uppercase tracking-wider text-xs">
                  Email
                </div>
              </TableHead>
              <TableHead className="align-top py-2 px-2 text-text-secondary">
                <div className="font-semibold uppercase tracking-wider text-xs">
                  Rol
                </div>
              </TableHead>
              <TableHead className="align-top py-2 px-2 text-text-secondary">
                <div className="font-semibold uppercase tracking-wider text-xs">
                  Status
                </div>
              </TableHead>
              <TableHead className="align-top py-2 px-2 text-text-secondary">
                <div className="font-semibold uppercase tracking-wider text-xs text-right">
                  Acties
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow
                key={u.id}
                className="hover:bg-bg-hover border-border-dark transition-colors"
              >
                <TableCell className="py-2 px-2 text-sm">
                  {u.name}
                </TableCell>
                <TableCell className="py-2 px-2 text-sm">
                  {u.email}
                </TableCell>
                <TableCell className="py-2 px-2 text-sm">
                  {u.role}
                </TableCell>
                <TableCell className="py-2 px-2 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      u.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {u.isActive ? "Actief" : "Inactief"}
                  </span>
                </TableCell>
                <TableCell className="py-2 px-2 text-sm text-right">
                  {u.id !== currentUserId && (
                    <button
                      onClick={() => handleToggle(u.id, u.isActive)}
                      disabled={isPending}
                      className="text-accent-primary hover:text-accent-glow disabled:opacity-50"
                    >
                      {u.isActive ? "Deactiveren" : "Activeren"}
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
