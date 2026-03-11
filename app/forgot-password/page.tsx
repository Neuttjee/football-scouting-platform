"use client";

import * as React from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Er is een fout opgetreden.");
        return;
      }
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Er is een onverwachte fout opgetreden. Probeer het later opnieuw.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md card-premium rounded-xl border border-border-dark p-6 shadow-lg">
        <h1 className="text-2xl font-bold tracking-tight mb-2 text-text-primary">
          Wachtwoord vergeten
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Vul je e-mailadres in. Als we een account vinden, sturen we een link om je wachtzin opnieuw in te
          stellen.
        </p>

        {submitted ? (
          <div className="text-sm text-text-primary space-y-2">
            <p>
              Als er een account bestaat voor <span className="font-semibold">{email}</span>, is er een
              e-mail verzonden met verdere instructies.
            </p>
            <p className="text-xs text-muted-foreground">
              Controleer ook je spamfolder als je niets ziet verschijnen.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center text-xs text-accent-primary hover:text-accent-glow mt-4"
            >
              ← Terug naar inloggen
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/40 px-3 py-2 rounded">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
                E-mailadres
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none text-sm"
                placeholder="e-mail@club.nl"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center px-4 py-2 rounded-full bg-accent-primary text-white text-sm font-medium hover:bg-accent-glow disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Verzenden..." : "Stuur resetlink"}
            </button>

            <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Tip: kies straks een sterke wachtzin, bijvoorbeeld een zin van minimaal 4 woorden en 16+ tekens.
              </span>
              <Link
                href="/login"
                className="ml-4 text-accent-primary hover:text-accent-glow whitespace-nowrap"
              >
                ← Terug naar inloggen
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

