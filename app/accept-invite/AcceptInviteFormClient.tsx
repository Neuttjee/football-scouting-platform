"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { isStrongPassword, PASSWORD_POLICY_ERROR } from "@/lib/passwordPolicy";

type AcceptInviteFormProps = {
  token: string;
  defaultName: string | null;
  email: string;
  clubName: string;
  role: string;
};

export function AcceptInviteForm({ token, defaultName, email, clubName, role }: AcceptInviteFormProps) {
  const [name, setName] = React.useState(defaultName || "");
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
        <p className="text-sm text-muted-foreground">
          Je account is succesvol aangemaakt. Je kunt nu inloggen met je e-mailadres en gekozen wachtwoord.
        </p>
        <Button asChild className="w-full btn-premium text-white">
          <Link href="/login">Naar de loginpagina</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Je bent uitgenodigd voor <span className="font-semibold text-text-primary">{clubName}</span> als rol{" "}
        <span className="font-semibold text-text-primary">{role}</span>.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/40 px-3 py-2 rounded">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Naam
          </Label>
          <Input
            id="name"
            type="text"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-bg-primary text-text-primary"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            E-mailadres
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
            className="bg-bg-secondary text-text-secondary cursor-not-allowed"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Wachtwoord
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              data-lpignore="true"
              data-1p-ignore="true"
              data-form-type="other"
              data-bwignore="true"
              spellCheck={false}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-bg-primary text-text-primary pr-10 hide-password-reveal"
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
          <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Wachtwoord bevestigen
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              autoComplete="new-password"
              data-lpignore="true"
              data-1p-ignore="true"
              data-form-type="other"
              data-bwignore="true"
              spellCheck={false}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-bg-primary text-text-primary pr-10 hide-password-reveal"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              onMouseDown={(e) => e.preventDefault()}
              tabIndex={-1}
              className="absolute inset-y-0 right-3 flex items-center text-text-muted hover:text-accent-primary"
              aria-label={showConfirmPassword ? "Bevestig wachtwoord verbergen" : "Bevestig wachtwoord tonen"}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full btn-premium text-white" disabled={isSubmitting}>
          {isSubmitting ? "Account aanmaken..." : "Account aanmaken"}
        </Button>
      </form>
    </div>
  );
}

