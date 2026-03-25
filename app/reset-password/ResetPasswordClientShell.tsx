"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResetPasswordForm } from "./ResetPasswordFormClient";

export default function ResetPasswordClientShell({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  const [success, setSuccess] = React.useState(false);

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
            />
          </div>

          <CardTitle className="text-2xl font-bold tracking-tight">
            Football Scouting Platform
          </CardTitle>

          <CardDescription>
            {success
              ? "Je wachtwoord is succesvol bijgewerkt. Je kunt nu inloggen met je nieuwe gegevens."
              : `Stel een nieuw, sterk wachtwoord in voor ${email}.`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <ResetPasswordForm token={token} onSuccess={() => setSuccess(true)} />
        </CardContent>
      </Card>
    </div>
  );
}

