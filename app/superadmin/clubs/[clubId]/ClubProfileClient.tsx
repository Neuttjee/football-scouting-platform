"use client";

import * as React from "react";
import Link from "next/link";
import { SegmentedToggle } from "@/components/SegmentedToggle";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { StatusPill } from "@/components/StatusPill";
import { CLUB_FEATURE_DEFINITIONS } from "@/lib/clubFeatures";
import {
  updateClubGeneral,
  updateClubFeatures,
  updateClubLimits,
  updateClubSubscription,
  updateClubPlan,
  updateClubInternalNotes,
} from "./actions";

type ClubProfileClientProps = {
  club: any;
  settings: { maxUsers: number } | null;
  featureState: Record<string, boolean>;
  subscription: any | null;
  internalNote: { notes: string | null } | null;
  userStats: {
    activeUsers: number;
  };
  clubUsers: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    isActive: boolean;
  }[];
};

type Section = "general" | "modules" | "subscription" | "billing" | "internal";

export function ClubProfileClient({
  club,
  settings,
  featureState,
  subscription,
  internalNote,
  userStats,
  clubUsers,
}: ClubProfileClientProps) {
  const [savingSection, setSavingSection] = React.useState<string | null>(null);
  const [section, setSection] = React.useState<Section>("general");

  const handleSubmit =
    (sectionKey: string, action: (clubId: string, formData: FormData) => Promise<void>) =>
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSavingSection(sectionKey);
      try {
        const formData = new FormData(e.currentTarget);
        await action(club.id, formData);
      } catch (err) {
        console.error(err);
        alert("Opslaan mislukt. Controleer de invoer en probeer opnieuw.");
      } finally {
        setSavingSection(null);
      }
    };

  const maxUsers = settings?.maxUsers ?? 999;
  const planMaxUsers =
    subscription?.plan === "BASIC"
      ? 5
      : subscription?.plan === "PREMIUM"
      ? 10
      : subscription?.plan === "CUSTOM"
      ? 15
      : maxUsers;
  const freeSeats = Math.max(0, planMaxUsers - userStats.activeUsers);

  const statusTone = (() => {
    const status = (club as any).status;
    switch (status) {
      case "ACTIEF":
        return "success";
      case "PROEFPERIODE":
        return "warning";
      case "INACTIEF":
      case "GESCHORST":
        return "danger";
      default:
        return "neutral";
    }
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4 items-center">
        <div className="space-y-2">
          <Link
            href="/superadmin"
            className="text-text-muted hover:text-text-primary transition-colors text-sm uppercase tracking-wider font-medium inline-flex items-center gap-1"
          >
            <span>←</span>
            <span>Terug naar clubs</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{club.name}</h1>
            <p className="text-sm text-muted-foreground">
              Beheer clubinstellingen, modules, limieten en abonnement als superadmin.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusPill tone={statusTone as any}>
            {(club as any).status || "ACTIEF"}
          </StatusPill>
          <span className="text-xs text-muted-foreground">
            Club ID: {club.id}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <SegmentedToggle<Section>
          value={section}
          onChange={setSection}
          size="sm"
          options={[
            { value: "general", label: "Algemeen" },
            { value: "modules", label: "Modules" },
            { value: "subscription", label: "Abonnement" },
            { value: "billing", label: "Facturatie" },
            { value: "internal", label: "Intern beheer" },
          ]}
        />

        {section === "general" && (
          <Card>
            <CardHeader>
              <CardTitle>Algemene clubgegevens</CardTitle>
              <CardDescription>
                Basisgegevens, contactinformatie en branding voor deze club.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit("general", updateClubGeneral)}>
              <input type="hidden" name="clubId" value={club.id} />
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Clubnaam
                    </label>
                    <input
                      name="name"
                      defaultValue={club.name}
                      required
                      className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Contactpersoon
                    </label>
                    <input
                      name="contactName"
                      defaultValue={(club as any).contactName || ""}
                      className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      E-mailadres
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      defaultValue={(club as any).contactEmail || ""}
                      className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Telefoon
                    </label>
                    <input
                      name="contactPhone"
                      defaultValue={(club as any).contactPhone || ""}
                      className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Primaire kleur
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        name="primaryColor"
                        defaultValue={(club as any).primaryColor || "#FF6A00"}
                        className="h-10 w-20 border-0 rounded cursor-pointer bg-transparent"
                      />
                      <span className="text-xs text-muted-foreground">
                        Gebruikt voor knoppen, accenten en highlights.
                      </span>
                    </div>
                  </div>
                </div>

                <input
                  type="hidden"
                  name="secondaryColor"
                  defaultValue={(club as any).secondaryColor || "#1F2933"}
                />

                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Interne notities
                  </label>
                  <textarea
                    name="internalNotes"
                    defaultValue={internalNote?.notes || ""}
                    rows={4}
                    className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none text-sm"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="btn-premium text-white px-6 py-2 rounded-lg transition disabled:opacity-50 font-medium"
                  disabled={savingSection === "general"}
                >
                  {savingSection === "general" ? "Opslaan..." : "Opslaan"}
                </button>
              </CardFooter>
            </form>
          </Card>
        )}

        {section === "modules" && (
          <Card>
            <CardHeader>
              <CardTitle>Modules</CardTitle>
              <CardDescription>
                Bepaal welke onderdelen van het platform beschikbaar zijn voor deze club.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit("features", updateClubFeatures)}>
              <input type="hidden" name="clubId" value={club.id} />
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CLUB_FEATURE_DEFINITIONS.filter((feature) =>
                    ["dashboard", "external_players", "internal_players", "tasks", "contact_logs", "shortlists", "contracts", "match_reports"].includes(feature.key)
                  ).map((feature) => (
                    <label
                      key={feature.key}
                      className="flex items-start gap-3 rounded-lg border border-border-dark bg-bg-primary/60 px-3 py-2 cursor-pointer hover:border-accent-primary/60"
                    >
                      <input
                        type="checkbox"
                        name={`feature_${feature.key}`}
                        defaultChecked={featureState[feature.key]}
                        className="mt-1 h-4 w-4 rounded border-border-dark bg-bg-primary"
                      />
                      <div>
                        <div className="text-sm font-medium text-text-primary">
                          {feature.label}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="btn-premium text-white px-6 py-2 rounded-lg transition disabled:opacity-50 font-medium"
                  disabled={savingSection === "features"}
                >
                  {savingSection === "features" ? "Opslaan..." : "Opslaan"}
                </button>
              </CardFooter>
            </form>
          </Card>
        )}

        {section === "subscription" && (
          <Card>
            <CardHeader>
              <CardTitle>Abonnement</CardTitle>
              <CardDescription>
                Kies het abonnementsniveau en basisparameters. Facturatiegegevens stel je in op het tabblad Facturatie.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit("subscription", updateClubPlan)}>
              <input type="hidden" name="clubId" value={club.id} />
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Abonnementstype
                    </label>
                    <select
                      name="plan"
                      defaultValue={subscription?.plan || "BASIC"}
                      className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
                    >
                      <option value="BASIC">Scout Core (tot 5 gebruikers)</option>
                      <option value="PREMIUM">Scout Pro (tot 10 gebruikers)</option>
                      <option value="CUSTOM">Scout Elite (tot 15 gebruikers)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Status
                    </label>
                    <select
                      name="status"
                      defaultValue={subscription?.status || "ACTIVE"}
                      className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
                    >
                      <option value="ACTIVE">Actief</option>
                      <option value="PAUSED">Gepauzeerd</option>
                      <option value="CANCELED">Opgezegd</option>
                      <option value="EXPIRED">Verlopen</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-lg bg-bg-primary/70 border border-border-dark p-4">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Actieve gebruikers
                    </div>
                    <div className="text-2xl font-semibold">
                      {userStats.activeUsers}
                    </div>
                  </div>
                  <div className="rounded-lg bg-bg-primary/70 border border-border-dark p-4">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Maximaal toegestaan
                    </div>
                    <div className="text-2xl font-semibold">{planMaxUsers}</div>
                  </div>
                  <div className="rounded-lg bg-bg-primary/70 border border-border-dark p-4">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Nog beschikbaar
                    </div>
                    <div className="text-2xl font-semibold">
                      {freeSeats}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-text-primary">Gebruikers</h3>
                  <p className="text-xs text-muted-foreground">
                    Overzicht van alle gebruikers die aan deze club zijn gekoppeld.
                  </p>
                  <div className="overflow-x-auto border border-border-dark rounded-lg">
                    <table className="min-w-full text-sm">
                      <thead className="bg-bg-secondary">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">
                            Naam
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">
                            E-mailadres
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">
                            Rol
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {clubUsers.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-3 py-4 text-center text-xs text-text-muted"
                            >
                              Geen gebruikers gekoppeld aan deze club.
                            </td>
                          </tr>
                        ) : (
                          clubUsers.map((u) => (
                            <tr key={u.id} className="border-t border-border-dark">
                              <td className="px-3 py-2 text-text-primary">
                                {u.name || "-"}
                              </td>
                              <td className="px-3 py-2 text-text-secondary">
                                {u.email || "-"}
                              </td>
                              <td className="px-3 py-2 text-text-secondary">
                                {u.role}
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={
                                    u.isActive
                                      ? "inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 text-[11px] font-medium"
                                      : "inline-flex items-center rounded-full bg-red-500/10 text-red-400 border border-red-500/40 px-2 py-0.5 text-[11px] font-medium"
                                  }
                                >
                                  {u.isActive ? "Actief" : "Inactief"}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="btn-premium text-white px-6 py-2 rounded-lg transition disabled:opacity-50 font-medium"
                  disabled={savingSection === "subscription"}
                >
                  {savingSection === "subscription" ? "Opslaan..." : "Opslaan"}
                </button>
              </CardFooter>
            </form>
          </Card>
        )}

        {section === "billing" && (
          <Card>
            <CardHeader>
              <CardTitle>Facturatie</CardTitle>
              <CardDescription>
                Beheer factuurgegevens, betaalstatus en facturatieperiode voor deze club.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit("billing", updateClubSubscription)}>
              <input type="hidden" name="clubId" value={club.id} />
              <input type="hidden" name="plan" value={subscription?.plan || "BASIC"} />
              <input type="hidden" name="status" value={subscription?.status || "ACTIVE"} />
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Facturatieperiode
                    </label>
                    <select
                      name="billingCycle"
                      defaultValue={subscription?.billingCycle || "MONTHLY"}
                      className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
                    >
                      <option value="MONTHLY">Maandelijks</option>
                      <option value="YEARLY">Jaarlijks</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Prijs (centen)
                    </label>
                    <input
                      type="number"
                      name="priceMinor"
                      min={0}
                      defaultValue={subscription?.priceMinor ?? ""}
                      className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
                      placeholder="Bijv. 9900 voor €99,00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Valuta
                    </label>
                    <input
                      name="currency"
                      defaultValue={subscription?.currency || "EUR"}
                      className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Betaalstatus
                    </label>
                    <select
                      name="paymentStatus"
                      defaultValue={subscription?.paymentStatus || "OPEN"}
                      className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
                    >
                      <option value="PAID">Betaald</option>
                      <option value="OPEN">Openstaand</option>
                      <option value="PAST_DUE">Te laat</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Ingangsdatum
                    </label>
                    <input
                      type="date"
                      name="startsAt"
                      defaultValue={
                        subscription?.startsAt
                          ? new Date(subscription.startsAt).toISOString().slice(0, 10)
                          : ""
                      }
                      className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Verlengdatum
                    </label>
                    <input
                      type="date"
                      name="renewsAt"
                      defaultValue={
                        subscription?.renewsAt
                          ? new Date(subscription.renewsAt).toISOString().slice(0, 10)
                          : ""
                      }
                      className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Einddatum
                    </label>
                    <input
                      type="date"
                      name="endsAt"
                      defaultValue={
                        subscription?.endsAt
                          ? new Date(subscription.endsAt).toISOString().slice(0, 10)
                          : ""
                      }
                      className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Betalmethode
                    </label>
                    <select
                      name="paymentMethod"
                      defaultValue={subscription?.paymentMethod || "MANUAL"}
                      className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
                    >
                      <option value="MANUAL">Handmatig</option>
                      <option value="INVOICE">Factuur</option>
                      <option value="DIRECT_DEBIT">Incasso</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Factuurreferentie / klantnummer
                    </label>
                    <div className="flex flex-col gap-2">
                      <input
                        name="invoiceReference"
                        defaultValue={subscription?.invoiceReference || ""}
                        className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
                        placeholder="Factuurreferentie"
                      />
                      <input
                        name="customerNumber"
                        defaultValue={subscription?.customerNumber || ""}
                        className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
                        placeholder="Klantnummer"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Betaalnotities
                  </label>
                  <textarea
                    name="notes"
                    defaultValue={subscription?.notes || ""}
                    rows={4}
                    className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none text-sm"
                    placeholder="Interne betaalafspraken, korting, betalingsgedrag..."
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="btn-premium text-white px-6 py-2 rounded-lg transition disabled:opacity-50 font-medium"
                  disabled={savingSection === "billing"}
                >
                  {savingSection === "billing" ? "Opslaan..." : "Opslaan"}
                </button>
              </CardFooter>
            </form>
          </Card>
        )}

        {section === "internal" && (
          <Card>
            <CardHeader>
              <CardTitle>Intern beheer</CardTitle>
              <CardDescription>
                Interne notities en maatwerkafspraken voor deze club.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit("internal", updateClubInternalNotes)}>
              <input type="hidden" name="clubId" value={club.id} />
              <CardContent>
                <textarea
                  name="notes"
                  defaultValue={internalNote?.notes || ""}
                  rows={10}
                  className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none text-sm"
                />
              </CardContent>
              <CardFooter className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="btn-premium text-white px-6 py-2 rounded-lg transition disabled:opacity-50 font-medium"
                  disabled={savingSection === "internal"}
                >
                  {savingSection === "internal" ? "Opslaan..." : "Opslaan"}
                </button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}

