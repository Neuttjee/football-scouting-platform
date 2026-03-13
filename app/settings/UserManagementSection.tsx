'use client';

import * as React from "react";
import { useRouter } from "next/navigation";
import { UserTable } from "./UserTable";

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

type UsersResponse = {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
};

type UserManagementSectionProps = {
  currentUserId: string;
  hasTwoFactorModule: boolean;
  canManageTwoFactor: boolean;
};

export function UserManagementSection({
  currentUserId,
  hasTwoFactorModule,
  canManageTwoFactor,
}: UserManagementSectionProps) {
  const router = useRouter();
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadUsers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/settings/users");
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Kon gebruikers niet laden");
      }
      const data: UsersResponse = await res.json();
      setUsers(data.users);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Er is iets misgegaan bij het laden van gebruikers.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleAfterChange = React.useCallback(async () => {
    await loadUsers();
    router.refresh();
  }, [loadUsers, router]);

  return (
    <section className="card-premium p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Gebruikersbeheer</h2>
      </div>

      {isLoading && users.length === 0 ? (
        <p className="text-sm text-text-muted">Gebruikers laden...</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <UserTable
          users={users}
          currentUserId={currentUserId}
          hasTwoFactorModule={hasTwoFactorModule}
          canManageTwoFactor={canManageTwoFactor}
          onAfterChange={handleAfterChange}
        />
      )}
    </section>
  );
}

