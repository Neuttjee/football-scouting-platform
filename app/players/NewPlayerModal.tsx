"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createPlayer } from "./actions"
import { targetSteps, targetStatuses, adviesOptions } from "@/lib/statusMapping"
import { PlayerDobAgeFields } from "./PlayerDobAgeFields"
import { PlayerTypeToggle, PlayerTypeValue } from "@/components/PlayerTypeToggle";

type TeamOption = {
  id: string
  name: string
  code: string | null
}

export function NewPlayerModal({ teams }: { teams: TeamOption[] }) {
  const [open, setOpen] = React.useState(false)
  const [playerType, setPlayerType] = React.useState<PlayerTypeValue>("EXTERNAL");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await createPlayer(formData)
    } finally {
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-premium text-white transition">
          Speler toevoegen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-bg-card border-accent-primary text-text-primary">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Speler toevoegen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type speler + Top speler */}
            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <span className="block text-text-muted uppercase tracking-wider text-xs">
                  Type speler
                </span>
                <input type="hidden" name="type" value={playerType} />
                <PlayerTypeToggle
                  value={playerType}
                  onChange={setPlayerType}
                  size="sm"
                />
              </div>
              {playerType === "INTERNAL" && (
                <label className="flex items-center gap-2 text-sm text-text-secondary">
                  <input type="checkbox" name="isTopTalent" />
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
                required
                className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
              />
            </div>

            {/* Geboortedatum / leeftijd */}
            <PlayerDobAgeFields />

            {/* Club + Team (extern), of alleen teamselect (intern) */}
            {playerType === "INTERNAL" ? (
              <>
                <div>
                  <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                    Team
                  </label>
                  <select
                    name="teamId"
                    className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-border-accent-primary focus-visible:outline-none"
                  >
                    <option value=""></option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.code || team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                    Huidige Club
                  </label>
                  <input
                    type="text"
                    name="currentClub"
                    className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-border-accent-primary focus-visible:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                    Team
                  </label>
                  <input
                    type="text"
                    name="team"
                    className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-border-accent-primary focus-visible:outline-none"
                  />
                </div>
              </>
            )}

            {/* Niveau / Beste positie */}
            <div>
              <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                Niveau (Huidig)
              </label>
              <input
                type="text"
                name="niveau"
                className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-border-accent-primary focus-visible:outline-none"
              />
            </div>
            <div>
              <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                Beste positie
              </label>
              <input
                type="text"
                name="position"
                className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-border-accent-primary focus-visible:outline-none"
              />
            </div>

            {/* Neven / Favoriete positie */}
            <div>
              <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                Nevenpositie
              </label>
              <input
                type="text"
                name="secondaryPosition"
                className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-border-accent-primary focus-visible:outline-none"
              />
            </div>
            <div>
              <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                Favoriete positie
              </label>
              <input
                type="text"
                name="favoritePosition"
                className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-border-accent-primary focus-visible:outline-none"
              />
            </div>

            {/* Voet / Contactpersoon */}
            <div>
              <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                Voorkeursbeen
              </label>
              <select
                name="preferredFoot"
                className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-border-accent-primary focus-visible:outline-none"
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
                className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-border-accent-primary focus-visible:outline-none"
              />
            </div>

            {/* Externe status / stap / advies */}
            {playerType === "EXTERNAL" && (
              <>
                <div>
                  <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-border-accent-primary focus-visible:outline-none"
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
                    className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-border-accent-primary focus-visible:outline-none"
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
                    className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-border-accent-primary focus-visible:outline-none"
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

            {/* Interne situatie onderaan */}
            {playerType === "INTERNAL" && (
              <>
                <div>
                  <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                    Bij club sinds
                  </label>
                  <input
                    type="date"
                    name="joinedAt"
                    className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-border-accent-primary focus-visible:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                    Contract tot
                  </label>
                  <input
                    type="date"
                    name="contractEndDate"
                    className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-border-accent-primary focus-visible:outline-none"
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
                    className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-border-accent-primary focus-visible:outline-none"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
              Korte Notities
            </label>
            <textarea
              name="notes"
              className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-border-accent-primary focus-visible:outline-none"
              rows={3}
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" className="btn-premium text-white">
              Opslaan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}