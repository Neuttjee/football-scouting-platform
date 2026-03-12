import prisma from "@/lib/prisma";
import { hashInviteToken } from "@/lib/inviteTokens";
import { AcceptInviteForm } from "./AcceptInviteFormClient";

export const dynamic = "force-dynamic";

type AcceptInvitePageProps = {
  searchParams: { token?: string } | Promise<{ token?: string }>;
};

export default async function AcceptInvitePage({ searchParams }: AcceptInvitePageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams as any);
  const rawToken = resolvedSearchParams?.token;

  if (!rawToken) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full card-premium p-8 rounded-xl border border-border-dark shadow-lg">
          <h1 className="text-2xl font-bold mb-4 text-text-primary">Uitnodiging ongeldig</h1>
          <p className="text-sm text-muted-foreground">
            Er is geen geldige uitnodigingslink gevonden. Controleer of je de volledige link uit de e-mail hebt
            gekopieerd of vraag een nieuwe uitnodiging aan bij je clubbeheerder.
          </p>
        </div>
      </main>
    );
  }

  const tokenHash = hashInviteToken(rawToken);

  const user = await prisma.user.findUnique({
    where: { inviteToken: tokenHash },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      club: { select: { name: true } },
      inviteTokenExpires: true,
      passwordHash: true,
    },
  });

  const now = new Date();

  if (!user || !user.inviteTokenExpires || user.inviteTokenExpires < now) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full card-premium p-8 rounded-xl border border-border-dark shadow-lg">
          <h1 className="text-2xl font-bold mb-4 text-text-primary">Uitnodiging verlopen of ongeldig</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Deze uitnodigingslink is ongeldig of verlopen. Vraag je clubbeheerder om een nieuwe uitnodiging te
            versturen.
          </p>
        </div>
      </main>
    );
  }

  if (user.passwordHash) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full card-premium p-8 rounded-xl border border-border-dark shadow-lg">
          <h1 className="text-2xl font-bold mb-4 text-text-primary">Uitnodiging al gebruikt</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Deze uitnodiging is al gebruikt om een account aan te maken. Je kunt inloggen met je bestaande
            inloggegevens.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full card-premium p-8 rounded-xl border border-border-dark shadow-lg">
        <h1 className="text-2xl font-bold mb-2 text-text-primary">Uitnodiging accepteren</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Je bent uitgenodigd voor{" "}
          <span className="font-semibold text-text-primary">
            {user.club?.name || "een club binnen het Football Scouting Platform"}
          </span>{" "}
          als rol{" "}
          <span className="font-semibold text-text-primary">
            {user.role}
          </span>
          .
        </p>

        <AcceptInviteForm token={rawToken} defaultName={user.name} email={user.email} />
      </div>
    </main>
  );
}
