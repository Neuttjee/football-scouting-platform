import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import AccountSecurityClient from "./securityClient";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true },
  });

  if (!user) return null;

  return (
    <main className="w-full max-w-[800px] mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Account</h1>
      <section className="card-premium p-6 rounded-lg shadow border border-border-dark space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">Accountgegevens</h2>
          <p className="text-sm text-muted-foreground">
            Inloggegevens en beveiliging voor je persoonlijke account.
          </p>
        </div>

        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-semibold text-text-primary">Naam: </span>
            <span className="text-text-secondary">{user.name}</span>
          </div>
          <div className="text-sm">
            <span className="font-semibold text-text-primary">E-mailadres: </span>
            <span className="text-text-secondary">{user.email}</span>
          </div>
        </div>

        <AccountSecurityClient />
      </section>
    </main>
  );
}

