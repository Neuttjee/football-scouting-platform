"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { isStrongPassword, PASSWORD_POLICY_ERROR } from "@/lib/passwordPolicy";

export default function PasswordChangeFormClient() {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isStrongPassword(newPassword)) {
      setError(PASSWORD_POLICY_ERROR);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Nieuwe wachtwoorden komen niet overeen.");
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

      setSuccess("Je wachtwoord is succesvol gewijzigd.");
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
    <div>
      <h3 className="text-lg font-semibold mb-2">Wachtwoord wijzigen</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Gebruik een sterk wachtwoord: minimaal 8 tekens, 1 hoofdletter, 1 kleine letter en 1 cijfer.
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
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              autoComplete="current-password"
              data-lpignore="true"
              data-1p-ignore="true"
              data-form-type="other"
              data-bwignore="true"
              spellCheck={false}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none text-sm pr-10 hide-password-reveal"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword((v) => !v)}
              onMouseDown={(e) => e.preventDefault()}
              tabIndex={-1}
              className="absolute inset-y-0 right-3 flex items-center text-text-muted hover:text-accent-primary"
              aria-label={showCurrentPassword ? "Huidig wachtwoord verbergen" : "Huidig wachtwoord tonen"}
            >
              {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
            Nieuwe wachtwoord
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              autoComplete="new-password"
              data-lpignore="true"
              data-1p-ignore="true"
              data-form-type="other"
              data-bwignore="true"
              spellCheck={false}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none text-sm pr-10 hide-password-reveal"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((v) => !v)}
              onMouseDown={(e) => e.preventDefault()}
              tabIndex={-1}
              className="absolute inset-y-0 right-3 flex items-center text-text-muted hover:text-accent-primary"
              aria-label={showNewPassword ? "Nieuwe wachtwoord verbergen" : "Nieuwe wachtwoord tonen"}
            >
              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
            Bevestig nieuwe wachtwoord
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              data-lpignore="true"
              data-1p-ignore="true"
              data-form-type="other"
              data-bwignore="true"
              spellCheck={false}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none text-sm pr-10 hide-password-reveal"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              onMouseDown={(e) => e.preventDefault()}
              tabIndex={-1}
              className="absolute inset-y-0 right-3 flex items-center text-text-muted hover:text-accent-primary"
              aria-label={
                showConfirmPassword ? "Bevestig wachtwoord verbergen" : "Bevestig wachtwoord tonen"
              }
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="btn-premium text-white transition"
        >
          {isSubmitting ? "Wachtwoord wijzigen..." : "Wachtwoord wijzigen"}
        </Button>
      </form>
    </div>
  );
}

