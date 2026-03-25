import prisma from "@/lib/prisma";
import { hashInviteToken } from "@/lib/inviteTokens";
import { ResetPasswordForm } from "./ResetPasswordFormClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ResetPasswordPageProps = {
  searchParams: { token?: string } | Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
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
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Football Scouting Platform</CardTitle>
            <CardDescription>Resetlink ongeldig</CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              Er is geen geldige resetlink gevonden. Vraag een nieuwe link aan via{" "}
              <a href="/forgot-password" className="text-accent-primary hover:text-accent-glow underline">
                Wachtwoord vergeten
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tokenHash = hashInviteToken(rawToken);

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: tokenHash,
      passwordResetExpires: { gt: new Date() },
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (!user) {
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
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Football Scouting Platform</CardTitle>
            <CardDescription>Resetlink verlopen of ongeldig</CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Deze resetlink is ongeldig of verlopen. Vraag een nieuwe link aan via{" "}
              <a href="/forgot-password" className="text-accent-primary hover:text-accent-glow underline">
                Wachtwoord vergeten
              </a>
              .
            </p>
          </CardContent>
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
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Football Scouting Platform</CardTitle>
          <CardDescription>Nieuw wachtwoord instellen</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Stel een nieuw, sterk wachtwoord in voor{" "}
            <span className="font-semibold text-text-primary">{user.email}</span>.
          </p>
          <ResetPasswordForm token={rawToken} />
        </CardContent>
      </Card>
    </div>
  );
}

