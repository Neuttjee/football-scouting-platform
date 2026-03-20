"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";

type TwoFactorStatusResponse = {
  hasTwoFactorModule: boolean;
  twoFactorEnabled: boolean;
  twoFactorVerifiedAt: string | Date | null;
  isConfigured: boolean;
};

export default function ClubTwoFactorToggleClient() {
  const [enabled, setEnabled] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [updating, setUpdating] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadStatus = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/2fa", { method: "GET" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Kon 2FA-status niet laden.");
      }
      const data = (await res.json()) as TwoFactorStatusResponse;
      setEnabled(Boolean(data.hasTwoFactorModule));
    } catch (e: any) {
      setError(e?.message || "Kon 2FA-status niet laden.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const setClubEnabled = async (nextEnabled: boolean) => {
    setUpdating(true);
    setError(null);
    try {
      const res = await fetch("/api/account/club-2fa-toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextEnabled }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Kon 2FA toggle niet wijzigen.");
      }
      setEnabled(nextEnabled);
    } catch (e: any) {
      setError(e?.message || "Kon 2FA toggle niet wijzigen.");
      await loadStatus();
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="mt-8 border-t border-border-dark pt-5">
      <h3 className="text-lg font-semibold mb-2">2FA aan/uit (club)</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Schakel de 2FA module in/uit voor deze club. Gebruikers krijgen 2FA bij login zodra ze hun TOTP hebben ingesteld.
      </p>

      {loading ? (
        <p className="text-sm text-muted-foreground">Laden...</p>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-2">
            <Checkbox
              checked={enabled}
              onCheckedChange={(val) => setClubEnabled(Boolean(val))}
              aria-label="2FA voor club aan/uit"
              disabled={updating}
            />
            <div className="text-sm">
              <span className={enabled ? "text-emerald-400 font-medium" : "text-text-secondary font-medium"}>
                {enabled ? "Aan" : "Uit"}
              </span>
            </div>
          </div>

          {error && <p className="text-sm text-destructive font-medium mb-2">{error}</p>}

          <p className="text-xs text-muted-foreground">
            Tip: als je een andere club wilt beheren, selecteer eerst die club.
          </p>
        </>
      )}
    </div>
  );
}

