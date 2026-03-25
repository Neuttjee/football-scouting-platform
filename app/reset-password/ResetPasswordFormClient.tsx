"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isStrongPassword, PASSWORD_POLICY_ERROR } from "@/lib/passwordPolicy";
import Link from "next/link";

type ResetPasswordFormProps = {
  token: string;
  onSuccess?: () => void;
};

export function ResetPasswordForm({ token, onSuccess }: ResetPasswordFormProps) {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isStrongPassword(password)) {
      setError(PASSWORD_POLICY_ERROR);
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
      onSuccess?.();
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
        <Button asChild className="w-full btn-premium text-white">
          <Link href="/login">Naar de loginpagina</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/40 px-3 py-2 rounded">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
          Nieuwe wachtwoord
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
            spellCheck={false}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none text-sm pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            onMouseDown={(e) => e.preventDefault()}
            tabIndex={-1}
            className="absolute inset-y-0 right-3 flex items-center text-text-muted hover:text-accent-primary"
            aria-label={showPassword ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
          Bevestig wachtwoord
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
            spellCheck={false}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none text-sm pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            onMouseDown={(e) => e.preventDefault()}
            tabIndex={-1}
            className="absolute inset-y-0 right-3 flex items-center text-text-muted hover:text-accent-primary"
            aria-label={showConfirmPassword ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full btn-premium text-white" disabled={isSubmitting}>
        {isSubmitting ? "Wachtwoord instellen..." : "Wachtwoord instellen"}
      </Button>
    </form>
  );
}

