"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PlayerDobAgeFields } from "./PlayerDobAgeFields";
import { PlayerTypeToggle, PlayerTypeValue } from "@/components/PlayerTypeToggle";
import { targetSteps, targetStatuses, adviesOptions } from "@/lib/statusMapping";

type TeamOption = {
  id: string;
  name: string;
  code: string | null;
};

// Dit is EditablePlayer, maar alle velden optioneel omdat we ook "new" doen.
export type PlayerFormValues = {
  id?: string;
  name?: string;
  type?: "INTERNAL" | "EXTERNAL";
  dateOfBirth?: string | Date | null;
  age?: number | null;
  currentClub?: string | null;
  team?: string | null;
  teamId?: string | null;
  joinedAt?: string | Date | null;
  contractEndDate?: string | Date | null;
  distanceFromClubKm?: number | null;
  isTopTalent?: boolean;
  niveau?: string | null;
  position?: string | null;
  secondaryPosition?: string | null;
  favoritePosition?: string | null;
  preferredFoot?: string | null;
  contactPerson?: string | null;
  status?: string | null;
  step?: string | null;
  advies?: string | null;
  notes?: string | null;
};

type PlayerFormProps = {
  mode: "create" | "edit";
  initialValues: PlayerFormValues;
  teams: TeamOption[];
  clubName?: string | null;
  onSubmit: (fd: FormData) => Promise<void> | void;
};

export function PlayerForm({
  mode,
  initialValues,
  teams,
  clubName,
  onSubmit,
}: PlayerFormProps) {
  const [playerType, setPlayerType] = React.useState<PlayerTypeValue>(
    initialValues.type === "INTERNAL" ? "INTERNAL" : "EXTERNAL"
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // zorg dat type altijd goed meegaat
    fd.set("type", playerType);
    await onSubmit(fd);
  };

  const isInternal = playerType === "INTERNAL";
  const currentClubLabel =
    isInternal
      ? (clubName || initialValues.currentClub || "")
      : (initialValues.currentClub || "");

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Type speler + Top speler */}
        <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="block text-text-muted uppercase tracking-wider text-xs">
              Type speler
            </span>
            <PlayerTypeToggle
              value={playerType}
              onChange={setPlayerType}
              size="sm"
            />
          </div>
          {isInternal && (
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                name="isTopTalent"
                defaultChecked={!!initialValues.isTopTalent}
              />
              Top speler
            </label>
          )}
        </div>

        {/* Naam */}
        <div className="md:col-span-2">
          <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
            Naam *
          </label>
          <input
            type="text"
            name="name"
            defaultValue={initialValues.name || ""}
            required
            className="w-full border border-border-dark rounded p-2 bg-background focus:border-accent-primary focus-visible:outline-none"
          />
        </div>

        {/* Geboortedatum / leeftijd */}
        <PlayerDobAgeFields
          initialDateOfBirth={
            initialValues.dateOfBirth
              ? new Date(initialValues.dateOfBirth).toISOString().split("T")[0]
              : ""
          }
          initialAge={initialValues.age ?? null}
        />

        {/* Rij 1: Club (huidig) / Team (huidig) */}
        <div>
          <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
            Club (Huidig)
          </label>
          <input
            type="text"
            name="currentClub"
            defaultValue={currentClubLabel}
            className="w-full border border-border-dark rounded p-2 bg-background focus:border-accent-primary focus-visible:outline-none"
          />
        </div>
        <div>
          <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
            Team (Huidig)
          </label>
          <input
            type="text"
            name="team"
            defaultValue={initialValues.team || ""}
            className="w-full border border-border-dark rounded p-2 bg-background focus-border-accent-primary focus-visible:outline-none"
          />
        </div>

        {/* Rij 2: Niveau / Beste positie */}
        <div>
          <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
            Niveau (Huidig)
          </label>
          <input
            type="text"
            name="niveau"
            defaultValue={initialValues.niveau || ""}
            className="w-full border border-border-dark rounded p-2 bg-background focus-border-accent-primary focus-visible:outline-none"
          />
        </div>
        <div>
          <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
            Beste positie
          </label>
          <input
            type="text"
            name="position"
            defaultValue={initialValues.position || ""}
            className="w-full border border-border-dark rounded p-2 bg-background focus-border-accent-primary focus-visible:outline-none"
          />
        </div>

        {/* Rij 3: Nevenpositie / Favoriete positie */}
        <div>
          <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
            Nevenpositie
          </label>
          <input
            type="text"
            name="secondaryPosition"
            defaultValue={initialValues.secondaryPosition || ""}
            className="w-full border border-border-dark rounded p-2 bg-background focus-border-accent-primary focus-visible:outline-none"
          />
        </div>
        <div>
          <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
            Favoriete positie
          </label>
          <input
            type="text"
            name="favoritePosition"
            defaultValue={initialValues.favoritePosition || ""}
            className="w-full border border-border-dark rounded p-2 bg-background focus-border-accent-primary focus-visible:outline-none"
          />
        </div>

        {/* Rij 4: Voorkeursbeen / Contactpersoon */}
        <div>
          <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
            Voorkeursbeen
          </label>
          <select
            name="preferredFoot"
            defaultValue={initialValues.preferredFoot || ""}
            className="w-full border border-border-dark rounded p-2 bg-background focus-border-accent-primary focus-visible:outline-none"
          >
            <option value=""></option>
            <option value="Rechts">Rechts</option>
            <option value="Links">Links</option>
            <option value="Tweebenig">Tweebenig</option>
          </select>
        </div>
        <div>
          <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
            Contactpersoon
          </label>
          <input
            type="text"
            name="contactPerson"
            defaultValue={initialValues.contactPerson || ""}
            className="w-full border border-border-dark rounded p-2 bg-background focus-border-accent-primary focus-visible:outline-none"
          />
        </div>

        {/* Extern: Status / Processtap / Advies */}
        {!isInternal && (
          <>
            <div>
              <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                Status
              </label>
              <select
                name="status"
                defaultValue={initialValues.status || ""}
                className="w-full border border-border-dark rounded p-2 bg-background focus-border-accent-primary focus-visible:outline-none"
              >
                <option value=""></option>
                {targetStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                Processtap
              </label>
              <select
                name="step"
                defaultValue={initialValues.step || ""}
                className="w-full border border-border-dark rounded p-2 bg-background focus-border-accent-primary focus-visible:outline-none"
              >
                <option value=""></option>
                {targetSteps.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                Advies
              </label>
              <select
                name="advies"
                defaultValue={initialValues.advies || ""}
                className="w-full border border-border-dark rounded p-2 bg-background focus-border-accent-primary focus-visible:outline-none"
              >
                <option value=""></option>
                {adviesOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Intern: Bij club sinds / Contract tot / Afstand tot club (km) */}
        {isInternal && (
          <>
            <div>
              <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                Bij club sinds
              </label>
              <input
                type="date"
                name="joinedAt"
                defaultValue={
                  initialValues.joinedAt
                    ? new Date(initialValues.joinedAt).toISOString().split("T")[0]
                    : ""
                }
                className="w-full border border-border-dark rounded p-2 bg-background focus-border-accent-primary focus-visible:outline-none"
              />
            </div>
            <div>
              <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                Contract tot
              </label>
              <input
                type="date"
                name="contractEndDate"
                defaultValue={
                  initialValues.contractEndDate
                    ? new Date(initialValues.contractEndDate).toISOString().split("T")[0]
                    : ""
                }
                className="w-full border border-border-dark rounded p-2 bg-background focus-border-accent-primary focus-visible:outline-none"
              />
            </div>
            <div>
              <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                Afstand tot club (km)
              </label>
              <input
                type="number"
                name="distanceFromClubKm"
                min={0}
                defaultValue={initialValues.distanceFromClubKm ?? ""}
                className="w-full border border-border-dark rounded p-2 bg-background focus-border-accent-primary focus-visible:outline-none"
              />
            </div>
          </>
        )}
      </div>

      {/* Notities + Opslaan */}
      <div>
        <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
          Korte Notities
        </label>
        <textarea
          name="notes"
          defaultValue={initialValues.notes || ""}
          className="w-full border border-border-dark rounded p-2 bg-background focus-border-accent-primary focus-visible:outline-none"
          rows={3}
        ></textarea>
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" className="btn-premium text-white">
          {mode === "edit" ? "Opslaan" : "Toevoegen"}
        </Button>
      </div>
    </form>
  );
}