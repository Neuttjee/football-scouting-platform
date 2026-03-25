import prisma from "@/lib/prisma";
import { hashInviteToken } from "@/lib/inviteTokens";
import { AcceptInviteForm } from "./AcceptInviteFormClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

type AcceptInvitePageProps = {
  searchParams: { token?: string } | Promise<{ token?: string }>;
};

export default async function AcceptInvitePage({ searchParams }: AcceptInvitePageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams as any);
  const rawToken = resolvedSearchParams?.token;

  if (!rawToken) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-lg transition-all duration-300 hover:border-accent-primary hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] focus-within:border-accent-primary focus-within:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] active:border-accent-primary active:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center mb-2">
              <img
                src="/football-scouting-platform-logo.png"
                alt="Football Scouting Platform Logo"
                className="h-16 w-auto object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Football Scouting Platform</CardTitle>
            <CardDescription>
              Er is geen geldige uitnodigingslink gevonden. Controleer of je de volledige link uit de e-mail hebt
              gekopieerd of vraag een nieuwe uitnodiging aan bij je clubbeheerder.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
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
      <div className="flex h-screen w-full items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-lg transition-all duration-300 hover:border-accent-primary hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] focus-within:border-accent-primary focus-within:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] active:border-accent-primary active:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center mb-2">
              <img
                src="/football-scouting-platform-logo.png"
                alt="Football Scouting Platform Logo"
                className="h-16 w-auto object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Football Scouting Platform</CardTitle>
            <CardDescription>
              Deze uitnodigingslink is ongeldig of verlopen. Vraag je clubbeheerder om een nieuwe uitnodiging te
              versturen.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (user.passwordHash) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-lg transition-all duration-300 hover:border-accent-primary hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] focus-within:border-accent-primary focus-within:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] active:border-accent-primary active:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center mb-2">
              <img
                src="/football-scouting-platform-logo.png"
                alt="Football Scouting Platform Logo"
                className="h-16 w-auto object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Football Scouting Platform</CardTitle>
            <CardDescription>
              Deze uitnodiging is al gebruikt om een account aan te maken. Je kunt inloggen met je bestaande
              inloggegevens.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg transition-all duration-300 hover:border-accent-primary hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] focus-within:border-accent-primary focus-within:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] active:border-accent-primary active:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center mb-2">
            <img
              src="/football-scouting-platform-logo.png"
              alt="Football Scouting Platform Logo"
              className="h-16 w-auto object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Football Scouting Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <AcceptInviteForm
            token={rawToken}
            defaultName={user.name}
            email={user.email}
            clubName={user.club?.name || "een club binnen het Football Scouting Platform"}
            role={user.role}
          />
        </CardContent>
      </Card>
    </div>
  );
}
