"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type TwoFactorStatusResponse = {
  hasTwoFactorModule: boolean;
  twoFactorEnabled: boolean;
  isConfigured: boolean;
};

export default function TwoFactorSetupClient({ role }: { role: string }) {
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [supported, setSupported] = React.useState<boolean | null>(null);

  const [qrCodeDataUrl, setQrCodeDataUrl] = React.useState<string | null>(null);
  const [twoFaCode, setTwoFaCode] = React.useState("");

  const [error, setError] = React.useState<string | null>(null);
  const [setupLoading, setSetupLoading] = React.useState(false);

  const redirectAfterSuccess = () => {
    // SUPERADMIN heeft een andere landingspagina.
    router.push(role === "SUPERADMIN" ? "/superadmin" : "/dashboard");
  };

  const beginSetup = async () => {
    setSetupLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "begin-setup" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Kon 2FA-setup niet starten.");
      }
      setQrCodeDataUrl(data?.qrCodeDataUrl ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kon 2FA-setup niet starten.");
    } finally {
      setSetupLoading(false);
    }
  };

  React.useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/account/2fa", { method: "GET" });
        const data = (await res.json().catch(() => ({}))) as TwoFactorStatusResponse & { error?: string };
        if (!res.ok) {
          throw new Error(data?.error || "Kon 2FA-status niet laden.");
        }

        setSupported(Boolean(data.hasTwoFactorModule));

        if (!data.hasTwoFactorModule) {
          // Niet beschikbaar voor deze club/module.
          setQrCodeDataUrl(null);
          return;
        }

        if (data.isConfigured) {
          redirectAfterSuccess();
          return;
        }

        await beginSetup();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Kon 2FA-setup niet laden.");
      } finally {
        setLoading(false);
      }
    };

    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/account/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", token: twoFaCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "De opgegeven code is ongeldig.");
      }

      redirectAfterSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Code controleren mislukt.");
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md card-premium rounded-xl border border-border-dark p-6 shadow-lg transition-all duration-300 hover:border-accent-primary hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] focus-within:border-accent-primary focus-within:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] active:border-accent-primary active:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]">
        <h1 className="text-2xl font-bold tracking-tight mb-2 text-text-primary">2FA instellen</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Scan de QR-code met je authenticator-app en bevestig daarna de 6-cijferige code.
        </p>

        {loading && <p className="text-sm text-muted-foreground">Laden...</p>}

        {!loading && supported === false && (
          <p className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/40 px-3 py-2 rounded">
            2FA module is niet actief voor deze club.
          </p>
        )}

        {!loading && supported !== false && (
          <>
            {error && (
              <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/40 px-3 py-2 rounded mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-col items-center gap-2">
                <div className="border border-border-dark rounded-xl bg-bg-secondary/40 p-3">
                  {qrCodeDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrCodeDataUrl} alt="Scan deze QR-code" className="h-48 w-48" />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {setupLoading ? "2FA-setup voorbereiden..." : "QR-code niet beschikbaar."}
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Scan de QR-code met je authenticator-app (bijvoorbeeld Google Authenticator of 1Password).
                </p>
              </div>

              <form onSubmit={verify} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
                    6-cijferige code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    pattern="[0-9]*"
                    required
                    value={twoFaCode}
                    onChange={(e) => setTwoFaCode(e.target.value)}
                    className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none text-sm tracking-[0.3em] text-center"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={setupLoading}
                  className="btn-premium text-white transition"
                >
                  {setupLoading ? "Code controleren..." : "Code bevestigen"}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

