'use client';

import * as React from "react";
import { toggleUserStatus } from './actions';
import { updateUserRole, resendInvite, deleteUser } from './actions';
import { useTransition } from 'react';
import { Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/DataTable"

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  passwordHash: string | null;
  inviteToken: string | null;
};

export function UserTable({ users, currentUserId }: { users: User[], currentUserId: string }) {
  const [isPending, startTransition] = useTransition();

  const [roleModalOpen, setRoleModalOpen] = React.useState(false);
  const [roleUserId, setRoleUserId] = React.useState<string | null>(null);
  const [roleValue, setRoleValue] = React.useState<string>("SCOUT");

  const handleChangeRole = (userId: string, currentRole: string) => {
    setRoleUserId(userId);
    setRoleValue(currentRole || "SCOUT");
    setRoleModalOpen(true);
  };
    
  const handleSubmitRole = () => {
    if (!roleUserId) return;
    startTransition(() => {
      updateUserRole(roleUserId, roleValue);
    });
    setRoleModalOpen(false);
  };

  const handleToggle = (userId: string, isActive: boolean) => {
    startTransition(() => {
      toggleUserStatus(userId, !isActive);
    });
  };

  const handleResendInvite = (userId: string) => {
    startTransition(() => {
      resendInvite(userId);
    });
  };

  const handleDeleteUser = (userId: string) => {
    const ok = window.confirm("Weet je zeker dat je deze gebruiker wilt verwijderen?");
    if (!ok) return;
    startTransition(() => {
      deleteUser(userId);
    });
  };

  return (
    <>
      <DataTable.Root>
        <DataTable.Header>
          <DataTable.HeaderRow>
            <DataTable.HeaderCell>Naam</DataTable.HeaderCell>
            <DataTable.HeaderCell>Email</DataTable.HeaderCell>
            <DataTable.HeaderCell>Rol</DataTable.HeaderCell>
            <DataTable.HeaderCell>Status</DataTable.HeaderCell>
            <DataTable.HeaderCell className="text-right">Acties</DataTable.HeaderCell>
          </DataTable.HeaderRow>
        </DataTable.Header>
        <DataTable.Body>
          {users.length === 0 ? (
            <DataTable.Empty colSpan={5}>Geen gebruikers gevonden.</DataTable.Empty>
          ) : (
            users.map((u) => (
              <DataTable.Row key={u.id}>
                <DataTable.Cell>{u.name}</DataTable.Cell>
                <DataTable.Cell>{u.email}</DataTable.Cell>
                <DataTable.Cell>{u.role}</DataTable.Cell>
                <DataTable.Cell>
                  {(!u.passwordHash && u.inviteToken) ? (
                    <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                      Uitgenodigd
                    </span>
                  ) : (
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        u.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {u.isActive ? "Actief" : "Inactief"}
                    </span>
                  )}
                </DataTable.Cell>
                <DataTable.Cell className="text-right">
                  {u.id !== currentUserId && (
                    <div className="flex justify-end pr-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1.5 bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 rounded-md transition-colors outline-none">
                          <Plus className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-bg-card border-border-dark min-w-[180px]">
                          <DropdownMenuItem
                            onClick={() => handleToggle(u.id, u.isActive)}
                            className="cursor-pointer focus:bg-bg-hover focus:text-accent-primary text-text-primary text-xs"
                          >
                            {u.isActive ? "Deactiveren" : "Activeren"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleChangeRole(u.id, u.role)}
                            className="cursor-pointer focus:bg-bg-hover focus:text-accent-primary text-text-primary text-xs"
                          >
                            Rol wijzigen
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleResendInvite(u.id)}
                            className="cursor-pointer focus:bg-bg-hover focus:text-accent-primary text-text-primary text-xs"
                          >
                            Uitnodiging opnieuw versturen
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(u.id)}
                            className="cursor-pointer focus:bg-bg-hover focus:text-accent-primary text-text-primary text-xs text-destructive"
                          >
                            Gebruiker verwijderen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </DataTable.Cell>
              </DataTable.Row>
            ))
          )}
        </DataTable.Body>
      </DataTable.Root>

    {/* Rol wijzigen modal */}
    {roleModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-bg-card border border-accent-primary rounded-lg shadow-lg p-6 w-full max-w-sm">
          <h3 className="text-lg font-semibold mb-4 text-text-primary">Rol wijzigen</h3>
          <div className="space-y-2">
            <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
              Rol
            </label>
            <select
              value={roleValue}
              onChange={(e) => setRoleValue(e.target.value)}
              className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
            >
              <option value="SCOUT">Scout</option>
              <option value="TC_LID">TC Lid</option>
              <option value="ADMIN">Beheerder (Admin)</option>
              <option value="LEZER">Lezer</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRoleModalOpen(false)}
              className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary"
            >
              Annuleren
            </button>
            <button
              type="button"
              onClick={handleSubmitRole}
              disabled={isPending}
              className="px-3 py-1.5 text-sm bg-accent-primary text-white rounded hover:bg-accent-glow disabled:opacity-50"
            >
              Opslaan
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);
}
