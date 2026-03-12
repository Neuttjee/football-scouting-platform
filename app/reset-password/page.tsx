import prisma from "@/lib/prisma";
import { hashInviteToken } from "@/lib/inviteTokens";
import { ResetPasswordForm } from "./ResetPasswordFormClient";

type ResetPasswordPageProps = {
  searchParams: { token?: string } | Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams as any);
  const rawToken = resolvedSearchParams?.token;

  if (!rawToken) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full card-premium p-8 rounded-xl border border-border-dark shadow-lg">
          <h1 className="text-2xl font-bold mb-4 text-text-primary">Resetlink ongeldig</h1>
          <p className="text-sm text-muted-foreground">
            Er is geen geldige resetlink gevonden. Vraag een nieuwe link aan via{" "}
            <a href="/forgot-password" className="text-accent-primary hover:text-accent-glow underline">
              Wachtwoord vergeten
            </a>
            .
          </p>
        </div>
      </main>
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
      <main className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full card-premium p-8 rounded-xl border border-border-dark shadow-lg">
          <h1 className="text-2xl font-bold mb-4 text-text-primary">Resetlink verlopen of ongeldig</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Deze resetlink is ongeldig of verlopen. Vraag een nieuwe link aan via{" "}
            <a href="/forgot-password" className="text-accent-primary hover:text-accent-glow underline">
              Wachtwoord vergeten
            </a>
            .
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full card-premium p-8 rounded-xl border border-border-dark shadow-lg">
        <h1 className="text-2xl font-bold mb-2 text-text-primary">Nieuw wachtwoord instellen</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Stel een nieuwe, sterke wachtzin in voor{" "}
          <span className="font-semibold text-text-primary">{user.email}</span>.
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Tip: gebruik een zin van minimaal 4 woorden en 16+ tekens, bijvoorbeeld:{" "}
          <span className="italic">"wij winnen altijd op zondag!"</span>
        </p>
        <ResetPasswordForm token={rawToken} />
      </div>
    </main>
  );
}

