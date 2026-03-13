\"use client\";

import * as React from "react";
import { useTransition } from "react";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/DataTable";
import { StatusPill } from "@/components/StatusPill";
import {
  toggleUserStatus,
  updateUserRole,
  resendInvite,
  deleteUser,
  setUserTwoFactorRequired,
  resetUserTwoFactor,
} from "./actions";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  passwordHash: string | null;
  inviteToken: string | null;
  inviteTokenExpires: string | Date | null;
  lastLoginAt?: string | Date | null;
  twoFactorEnabled: boolean;
  twoFactorVerifiedAt: string | Date | null;
  twoFactorResetAt: string | Date | null;
};

type UserTableProps = {
  users: User[];
  currentUserId: string;
  hasTwoFactorModule: boolean;
  canManageTwoFactor: boolean;
  onAfterChange?: () => Promise<void> | void;
};

export function UserTable({
  users,
  currentUserId,
  hasTwoFactorModule,
  canManageTwoFactor,
  onAfterChange,
}: UserTableProps) {
  const [isPending, startTransition] = useTransition();

  const [roleModalOpen, setRoleModalOpen] = React.useState(false);
  const [roleUserId, setRoleUserId] = React.useState<string | null>(null);
  const [roleValue, setRoleValue] = React.useState<string>("SCOUT");

  const handleChangeRole = (userId: string, currentRole: string) => {
    setRoleUserId(userId);
    setRoleValue(currentRole || "SCOUT");
    setRoleModalOpen(true);
  };

  const withRefresh = (action: () => Promise<void>) => {
    startTransition(async () => {
      await action();
      if (onAfterChange) {
        await onAfterChange();
      }
    });
  };

  const handleSubmitRole = () => {
    if (!roleUserId) return;
    withRefresh(() => updateUserRole(roleUserId, roleValue));
    setRoleModalOpen(false);
  };

  const handleToggle = (userId: string, isActive: boolean) => {
    withRefresh(() => toggleUserStatus(userId, !isActive));
  };

  const handleResendInvite = (userId: string) => {
    withRefresh(() => resendInvite(userId));
  };

  const handleDeleteUser = (userId: string) => {
    const ok = window.confirm("Weet je zeker dat je deze gebruiker wilt verwijderen?");
    if (!ok) return;
    withRefresh(() => deleteUser(userId));
  };

  const now = new Date();

  const getStatus = (u: User) => {
    if (!u.passwordHash && u.inviteToken && u.inviteTokenExpires) {
      const expires = new Date(u.inviteTokenExpires);
      if (expires < now) {
        return { label: "Uitnodiging verlopen", tone: "neutral" as const };
      }
      return { label: "Uitgenodigd", tone: "warning" as const };
    }
    if (u.isActive) return { label: "Actief", tone: "success" as const };
    return { label: "Inactief", tone: "danger" as const };
  };

  const getTwoFactorStatus = (u: User) => {
    if (!u.twoFactorEnabled) {
      return { label: "Uit", tone: "neutral" as const };
    }
    if (u.twoFactorEnabled && !u.twoFactorVerifiedAt) {
      return { label: "Vereist – nog niet ingesteld", tone: "warning" as const };
    }
    return { label: "Actief", tone: "success" as const };
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
            {hasTwoFactorModule && <DataTable.HeaderCell>2FA</DataTable.HeaderCell>}
            <DataTable.HeaderCell className="text-right">Acties</DataTable.HeaderCell>
          </DataTable.HeaderRow>
        </DataTable.Header>
        <DataTable.Body>
          {users.length === 0 ? (
            <DataTable.Empty colSpan={hasTwoFactorModule ? 6 : 5}>
              Geen gebruikers gevonden.
            </DataTable.Empty>
          ) : (
            users.map((u) => (
              <DataTable.Row key={u.id}>
                <DataTable.Cell>{u.name}</DataTable.Cell>
                <DataTable.Cell>{u.email}</DataTable.Cell>
                <DataTable.Cell>{u.role}</DataTable.Cell>
                <DataTable.Cell>
                  {(() => {
                    const status = getStatus(u);
                    return <StatusPill tone={status.tone}>{status.label}</StatusPill>;
                  })()}
                </DataTable.Cell>
                {hasTwoFactorModule && (
                  <DataTable.Cell>
                    {(() => {
                      const status = getTwoFactorStatus(u);
                      return <StatusPill tone={status.tone}>{status.label}</StatusPill>;
                    })()}
                  </DataTable.Cell>
                )}
                <DataTable.Cell className="text-right">
                  {u.id !== currentUserId && (
                    <div className="flex justify-end pr-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1.5 bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 rounded-md transition-colors outline-none">
                          <Plus className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-bg-card border-border-dark min-w-[180px]"
                        >
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
                          {hasTwoFactorModule && canManageTwoFactor && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  withRefresh(() =>
                                    setUserTwoFactorRequired(u.id, !u.twoFactorEnabled),
                                  )
                                }
                                className="cursor-pointer focus:bg-bg-hover focus:text-accent-primary text-text-primary text-xs"
                              >
                                {u.twoFactorEnabled
                                  ? "2FA niet meer verplichten"
                                  : "2FA verplichten"}
                              </DropdownMenuItem>
                              {u.twoFactorEnabled && (
                                <DropdownMenuItem
                                  onClick={() => withRefresh(() => resetUserTwoFactor(u.id))}
                                  className="cursor-pointer focus:bg-bg-hover focus:text-accent-primary text-text-primary text-xs"
                                >
                                  2FA resetten
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
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

