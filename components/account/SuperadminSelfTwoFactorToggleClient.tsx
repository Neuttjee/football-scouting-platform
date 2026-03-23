"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";

type SuperadminSelfTwoFactorStatus = {
  twoFactorEnabled: boolean;
  hasTwoFactorModule: boolean;
  isConfigured: boolean;
};

export default function SuperadminSelfTwoFactorToggleClient() {
  const [status, setStatus] = React.useState<SuperadminSelfTwoFactorStatus | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadStatus = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/superadmin-self-2fa", { method: "GET" });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Kon 2FA-status niet laden.");
      }
      const data = (await res.json()) as SuperadminSelfTwoFactorStatus;
      setStatus(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kon 2FA-status niet laden.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const toggleTwoFactor = async (nextEnabled: boolean) => {
    setUpdating(true);
    setError(null);
    try {
      const res = await fetch("/api/account/superadmin-self-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextEnabled }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Kon 2FA-toggle niet bijwerken.");
      }
      // Refresh so UI stays consistent with backend state.
      setStatus({
        twoFactorEnabled: Boolean(data?.twoFactorEnabled ?? nextEnabled),
        hasTwoFactorModule: Boolean(data?.hasTwoFactorModule ?? status?.hasTwoFactorModule ?? false),
        isConfigured: Boolean(data?.isConfigured ?? status?.isConfigured ?? false),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kon 2FA-toggle niet bijwerken.");
      await loadStatus();
    } finally {
      setUpdating(false);
    }
  };

  const checked = status?.twoFactorEnabled ?? false;
  const disabled = updating || loading || !(status?.hasTwoFactorModule ?? false);

  return (
    <div className="mt-8 border-t border-border-dark pt-5">
      <h3 className="text-lg font-semibold mb-2">2FA aan/uit (superadmin)</h3>

      <p className="text-sm text-muted-foreground mb-3">
        Zet de 2FA-vereiste voor je superadmin account aan/uit voor testdoeleinden.
      </p>

      {loading && <p className="text-sm text-muted-foreground">Laden...</p>}

      {!loading && (
        <>
          {error && (
            <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/40 px-3 py-2 rounded mb-3">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 mb-2">
            <Checkbox
              checked={checked}
              onCheckedChange={(val) => toggleTwoFactor(Boolean(val))}
              aria-label="2FA voor superadmin aan/uit"
              disabled={disabled}
            />
            <div className="text-sm">
              <span className={checked ? "text-emerald-400 font-medium" : "text-text-secondary font-medium"}>
                {checked ? "Aan" : "Uit"}
              </span>
            </div>
          </div>

          {!status?.hasTwoFactorModule && (
            <p className="text-xs text-muted-foreground">
              Tip: de 2FA-module staat uit voor Platform; daarom kun je deze toggle niet inschakelen.
            </p>
          )}

          {status?.hasTwoFactorModule && status?.twoFactorEnabled && !status?.isConfigured && (
            <p className="text-xs text-muted-foreground">
              Let op: 2FA is (nog) niet volledig ingesteld voor dit account, waardoor login mogelijk geen 2FA vereist.
            </p>
          )}
        </>
      )}
    </div>
  );
}

