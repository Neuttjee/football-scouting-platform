import { getSession, getEffectiveClubId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { BrandingForm } from "./BrandingForm";
import { ImportPlayersCard } from "./ImportPlayersCard";
import { getClubFeaturesByClubId } from "@/lib/clubConfig";

const UserManagementSection = dynamic(
  () => import("./UserManagementSection").then((m) => m.UserManagementSection),
  {
    loading: () => (
      <section className="card-premium p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 w-40 rounded bg-bg-secondary animate-pulse" />
        </div>
        <p className="text-sm text-text-muted">Gebruikers laden...</p>
      </section>
    ),
    ssr: false,
  },
);

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const clubId = getEffectiveClubId(session);
  if (!clubId) redirect("/superadmin");

  const [club, features] = await Promise.all([
    prisma.club.findUnique({ where: { id: clubId } }),
    getClubFeaturesByClubId(clubId),
  ]);

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPERADMIN";
  const hasTwoFactorModule = features?.two_factor_auth ?? false;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Instellingen</h1>
      </div>

      {isAdmin && (
        <>
          <section className="card-premium p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Club Branding</h2>
            <BrandingForm club={club} />
          </section>

          <UserManagementSection
            currentUserId={session.user.id}
            hasTwoFactorModule={hasTwoFactorModule}
            canManageTwoFactor={isAdmin && hasTwoFactorModule}
          />
        </>
      )}
      <ImportPlayersCard canImport={isAdmin} />
    </div>
  );
}

