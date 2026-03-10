import prisma from "@/lib/prisma";
import { hashInviteToken } from "@/lib/inviteTokens";

type ResetPasswordPageProps = {
  searchParams: { token?: string };
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const rawToken = searchParams.token;

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

"use client";

import * as React from "react";

type ResetPasswordFormProps = {
  token: string;
};

function isStrongPassphrase(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 16) return false;
  const words = trimmed.split(/\s+/);
  if (words.length < 4) return false;
  const hasLetter = /[A-Za-z]/.test(trimmed);
  if (!hasLetter) return false;
  return true;
}

function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isStrongPassphrase(password)) {
      setError("Gebruik een sterke wachtzin van minimaal 16 tekens en 4 woorden.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/password-reset", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Het instellen van het nieuwe wachtwoord is mislukt.");
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
          Je wachtzin is succesvol bijgewerkt. Je kunt nu inloggen met je nieuwe gegevens.
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
          Nieuwe wachtzin
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
          Bevestig wachtzin
        </label>
        <input
          type="password"
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
        {isSubmitting ? "Wachtzin instellen..." : "Wachtzin instellen"}
      </button>
    </form>
  );
}

