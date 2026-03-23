"use client";

import * as React from "react";
import PasswordChangeFormClient from "@/components/account/PasswordChangeFormClient";

export default function AccountSecurityClient({ children }: { children?: React.ReactNode }) {
  const [twoFaSupported, setTwoFaSupported] = React.useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = React.useState(false);
  const [twoFaConfigured, setTwoFaConfigured] = React.useState(false);
  const [twoFaQrCode, setTwoFaQrCode] = React.useState<string | null>(null);
  const [twoFaCode, setTwoFaCode] = React.useState("");
  const [twoFaError, setTwoFaError] = React.useState<string | null>(null);
  const [twoFaSuccess, setTwoFaSuccess] = React.useState<string | null>(null);
  const [twoFaLoading, setTwoFaLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const loadState = async () => {
      try {
        const res = await fetch("/api/account/2fa", { method: "GET" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setTwoFaSupported(Boolean(data.hasTwoFactorModule));
        setTwoFaEnabled(Boolean(data.twoFactorEnabled));
        setTwoFaConfigured(Boolean(data.isConfigured));
      } catch {
        // ignore
      }
    };
    loadState();
    return () => {
      cancelled = true;
    };
  }, []);

  const beginTwoFactorSetup = async () => {
    setTwoFaError(null);
    setTwoFaSuccess(null);
    setTwoFaLoading(true);
    try {
      const res = await fetch("/api/account/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "begin-setup" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTwoFaError(data.error || "Kan 2FA-setup niet starten.");
        return;
      }
      setTwoFaQrCode(data.qrCodeDataUrl || null);
    } catch (err) {
      console.error(err);
      setTwoFaError("Er is een fout opgetreden bij het starten van 2FA.");
    } finally {
      setTwoFaLoading(false);
    }
  };

  const verifyTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFaError(null);
    setTwoFaSuccess(null);
    setTwoFaLoading(true);
    try {
      const res = await fetch("/api/account/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", token: twoFaCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTwoFaError(data.error || "De opgegeven code is ongeldig.");
        return;
      }
      setTwoFaSuccess("Tweefactor authenticatie is succesvol geactiveerd.");
      setTwoFaConfigured(true);
      setTwoFaCode("");
    } catch (err) {
      console.error(err);
      setTwoFaError("Er is een fout opgetreden bij het verifiëren van de code.");
    } finally {
      setTwoFaLoading(false);
    }
  };

  return (
    <div className="mt-6 border-t border-border-dark pt-6">
      <PasswordChangeFormClient />

      {children}

      <div className="mt-10 border-t border-border-dark pt-6">
        <h3 className="text-lg font-semibold mb-2">Tweefactor authenticatie (2FA)</h3>
        {!twoFaSupported ? (
          <p className="text-sm text-muted-foreground">
            2FA is nog niet ingeschakeld voor jouw club. Een clubbeheerder kan dit activeren via de instellingen.
          </p>
        ) : (
          <div className="space-y-4 max-w-xl">
            <p className="text-sm text-muted-foreground">
              Verhoog de veiligheid van je account door bij het inloggen naast je wachtwoord ook een code uit een
              authenticator-app (zoals Google Authenticator) in te vullen.
            </p>

            {twoFaError && (
              <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/40 px-3 py-2 rounded">
                {twoFaError}
              </div>
            )}
            {twoFaSuccess && (
              <div className="text-sm text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/40 px-3 py-2 rounded">
                {twoFaSuccess}
              </div>
            )}

            {!twoFaConfigured && (
              <>
                {!twoFaQrCode ? (
                  <button
                    type="button"
                    disabled={twoFaLoading}
                    onClick={beginTwoFactorSetup}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-accent-primary text-white text-sm font-medium hover:bg-accent-glow disabled:opacity-50 transition-colors"
                  >
                    {twoFaLoading ? "2FA voorbereiden..." : "2FA instellen"}
                  </button>
                ) : (
                  <div className="grid gap-6 md:grid-cols-[220px,1fr] items-start">
                    <div className="flex flex-col items-center gap-2">
                      <div className="border border-border-dark rounded-xl bg-bg-secondary/40 p-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={twoFaQrCode}
                          alt="Scan deze QR-code met je authenticator-app"
                          className="h-48 w-48"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Scan de QR-code met je authenticator-app (bijvoorbeeld Google Authenticator of 1Password).
                      </p>
                    </div>
                    <form onSubmit={verifyTwoFactor} className="space-y-3">
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
                      <button
                        type="submit"
                        disabled={twoFaLoading}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-accent-primary text-white text-sm font-medium hover:bg-accent-glow disabled:opacity-50 transition-colors"
                      >
                        {twoFaLoading ? "Code controleren..." : "Code bevestigen"}
                      </button>
                    </form>
                  </div>
                )}
              </>
            )}

            {twoFaConfigured && (
              <p className="text-sm text-emerald-400">
                2FA is actief voor je account. Bij het inloggen wordt om een code uit je authenticator-app gevraagd.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

