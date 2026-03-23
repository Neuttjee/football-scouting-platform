"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { User } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import PasswordChangeFormClient from "@/components/account/PasswordChangeFormClient";

import SuperadminSelfTwoFactorToggleClient from "@/components/account/SuperadminSelfTwoFactorToggleClient";

export default function AccountDialog({
  role,
}: {
  role: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-border-dark bg-bg-secondary/60 hover:bg-bg-secondary transition-colors"
          aria-label="Account"
        >
          <User className="h-4 w-4 text-text-primary" />
        </button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-xl bg-bg-card border-accent-primary text-text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
        <div className="space-y-6">
          <PasswordChangeFormClient />

          {role === "SUPERADMIN" && <SuperadminSelfTwoFactorToggleClient />}

          <div className="pt-2">
            <LogoutButton />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

