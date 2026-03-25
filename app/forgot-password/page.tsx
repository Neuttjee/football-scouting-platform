"use client";

import * as React from "react";
import Link from "next/link";
import { useState } from "react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

          <CardDescription>Vul je e-mailadres in om een resetlink te ontvangen</CardDescription>
        </CardHeader>

        {submitted ? (
          <>
            <CardContent>
              <div className="text-sm text-text-primary space-y-2">
                <p>
                  Als er een account bestaat voor <span className="font-semibold">{email}</span>, is er een
                  e-mail verzonden met verdere instructies.
                </p>
                <p className="text-xs text-muted-foreground">Controleer ook je spamfolder als je niets ziet verschijnen.</p>
              </div>
            </CardContent>

            <CardFooter className="pt-8 pb-6 flex flex-col gap-3 items-center">
            <Link
              href="/login"
              className="self-center cursor-pointer text-xs text-accent-primary hover:text-accent-glow transition-colors underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/40 focus-visible:ring-accent-glow rounded-sm"
            >
              ← Terug naar inloggen
            </Link>
            </CardFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/40 px-3 py-2 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  E-mailadres
                </Label>

                {/* Placeholder weggelaten (zoals gevraagd) */}
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="pt-8 pb-6 flex flex-col gap-3 items-center">
              <Button type="submit" className="w-full btn-premium text-white" disabled={isSubmitting}>
                {isSubmitting ? "Verzenden..." : "Stuur resetlink"}
              </Button>

              {/* Terug naar inloggen gecentreerd */}
              <Link
                href="/login"
                className="self-center text-xs text-accent-primary hover:text-accent-glow transition-colors underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/40 focus-visible:ring-accent-glow rounded-sm"
              >
                ← Terug naar inloggen
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}