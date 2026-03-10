import prisma from "@/lib/prisma";
import { hashInviteToken } from "@/lib/inviteTokens";

type AcceptInvitePageProps = {
  searchParams: { token?: string };
};

export default async function AcceptInvitePage({ searchParams }: AcceptInvitePageProps) {
  const rawToken = searchParams.token;

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

        <AcceptInviteForm
          token={rawToken}
          defaultName={user.name}
          email={user.email}
        />
      </div>
    </main>
  );
}

// Client-side form in the same file for simplicity
"use client";

import * as React from "react";

type AcceptInviteFormProps = {
  token: string;
  defaultName: string;
  email: string;
};

function AcceptInviteForm({ token, defaultName, email }: AcceptInviteFormProps) {
  const [name, setName] = React.useState(defaultName || "");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || password.length < 8) {
      setError("Kies een wachtwoord van minimaal 8 tekens.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/invite", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, name }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Het accepteren van de uitnodiging is mislukt.");
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Er is een onverwachte fout opgetreden. Probeer het later opnieuw.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-text-primary">
          Je account voor <span className="font-semibold">{email}</span> is succesvol aangemaakt.
        </p>
        <p className="text-sm text-muted-foreground">
          Je kunt nu inloggen met je e-mailadres en gekozen wachtwoord.
        </p>
        <a
          href="/login"
          className="inline-flex items-center justify-center mt-2 px-4 py-2 rounded-full bg-accent-primary text-white text-sm font-medium hover:bg-accent-glow transition-colors"
        >
          Naar de loginpagina
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      {error && (
        <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/40 px-3 py-2 rounded">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
          Naam
        </label>
        <input
          type="text"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
          E-mailadres
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full border border-border-dark rounded p-2 bg-bg-secondary text-text-secondary text-sm cursor-not-allowed"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
          Wachtwoord
        </label>
        <input
          type="password"
          name="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
          Wachtwoord bevestigen
        </label>
        <input
          type="password"
          name="confirmPassword"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-2 inline-flex items-center justify-center px-4 py-2 rounded-full bg-accent-primary text-white text-sm font-medium hover:bg-accent-glow disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? "Account aanmaken..." : "Account aanmaken"}
      </button>
    </form>
  );
}

