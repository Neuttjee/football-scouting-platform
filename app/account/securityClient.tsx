"use client";

import * as React from "react";

function isStrongPassphrase(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 16) return false;
  const words = trimmed.split(/\s+/);
  if (words.length < 4) return false;
  const hasLetter = /[A-Za-z]/.test(trimmed);
  if (!hasLetter) return false;
  return true;
}

export default function AccountSecurityClient() {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isStrongPassphrase(newPassword)) {
      setError("Gebruik een sterke wachtzin van minimaal 16 tekens en 4 woorden.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Nieuwe wachtzinnen komen niet overeen.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Wachtwoord wijzigen is mislukt.");
        return;
      }
      setSuccess("Je wachtzin is succesvol gewijzigd.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setError("Er is een onverwachte fout opgetreden. Probeer het later opnieuw.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <h3 className="text-lg font-semibold mb-2">Wachtwoord wijzigen</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Gebruik een sterke wachtzin, bijvoorbeeld een zin van minimaal 4 woorden en 16+ tekens.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        {error && (
          <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/40 px-3 py-2 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/40 px-3 py-2 rounded">
            {success}
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
            Huidig wachtwoord
          </label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
            Nieuwe wachtzin
          </label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
            Bevestig nieuwe wachtzin
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-accent-primary text-white text-sm font-medium hover:bg-accent-glow disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Wachtzin wijzigen..." : "Wachtzin wijzigen"}
        </button>
      </form>

      <div className="mt-10 border-t border-border-dark pt-6">
        <h3 className="text-lg font-semibold mb-2">Tweefactor authenticatie (2FA)</h3>
        {!twoFaSupported ? (
          <p className="text-sm text-muted-foreground">
            2FA is nog niet ingeschakeld voor jouw club. Een clubbeheerder kan dit activeren via de instellingen.
          </p>
        ) : (
          <div className="space-y-4 max-w-xl">
            <p className="text-sm text-muted-foreground">
              Verhoog de veiligheid van je account door bij het inloggen naast je wachtzin ook een code uit een
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

