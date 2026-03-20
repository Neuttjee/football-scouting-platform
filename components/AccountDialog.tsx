"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { User } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import PasswordChangeFormClient from "@/components/account/PasswordChangeFormClient";
import ClubTwoFactorToggleClient from "@/components/account/ClubTwoFactorToggleClient";

export default function AccountDialog({ role }: { role: string }) {
  const isSuperadmin = role === "SUPERADMIN";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-border-dark bg-bg-secondary/60 hover:bg-bg-secondary transition-colors"
          aria-label="Account"
        >
          <User className="h-4 w-4 text-text-muted" />
        </button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-xl">
        <div className="space-y-6">
          <PasswordChangeFormClient />

          {isSuperadmin && <ClubTwoFactorToggleClient />}

          <div className="pt-2">
            <LogoutButton />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

