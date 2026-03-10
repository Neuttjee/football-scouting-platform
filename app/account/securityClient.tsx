"use client";

import * as React from "react";

function isStrongPassphrase(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 16) return false;
  const words = trimmed.split(/\s+/);
  if (words.length < 4) return false;
  const hasLetter = /[A-Za-z]/.test(trimmed);
  if (!hasLetter) return false;
  return true;
}

export default function AccountSecurityClient() {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isStrongPassphrase(newPassword)) {
      setError("Gebruik een sterke wachtzin van minimaal 16 tekens en 4 woorden.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Nieuwe wachtzinnen komen niet overeen.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Wachtwoord wijzigen is mislukt.");
        return;
      }
      setSuccess("Je wachtzin is succesvol gewijzigd.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setError("Er is een onverwachte fout opgetreden. Probeer het later opnieuw.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 border-t border-border-dark pt-6">
      <h3 className="text-lg font-semibold mb-2">Wachtwoord wijzigen</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Gebruik een sterke wachtzin, bijvoorbeeld een zin van minimaal 4 woorden en 16+ tekens.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        {error && (
          <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/40 px-3 py-2 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/40 px-3 py-2 rounded">
            {success}
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
            Huidig wachtwoord
          </label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
            Nieuwe wachtzin
          </label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
            Bevestig nieuwe wachtzin
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
          className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-accent-primary text-white text-sm font-medium hover:bg-accent-glow disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Wachtzin wijzigen..." : "Wachtzin wijzigen"}
        </button>
      </form>
    </div>
  );
}

