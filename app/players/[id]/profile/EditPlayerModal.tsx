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
import { updatePlayerProfile } from "../../actions"
import { targetSteps, targetStatuses, adviesOptions } from "@/lib/statusMapping"
import { PlayerDobAgeFields } from "../../PlayerDobAgeFields"
import { PlayerTypeToggle, PlayerTypeValue } from "@/components/PlayerTypeToggle";

type TeamOption = {
  id: string
  name: string
  code: string | null
}

type EditablePlayer = {
  id: string
  name: string
  type: "INTERNAL" | "EXTERNAL"
  dateOfBirth: string | Date | null
  age: number | null
  currentClub: string | null
  team: string | null
  teamId: string | null
  joinedAt: string | Date | null
  contractEndDate: string | Date | null
  distanceFromClubKm: number | null
  optionYear: boolean
  isTopTalent: boolean
  niveau: string | null
  position: string | null
  secondaryPosition: string | null
  favoritePosition: string | null
  preferredFoot: string | null
  contactPerson: string | null
  status: string | null
  step: string | null
  advies: string | null
  notes: string | null
}

export function EditPlayerModal({
  player,
  teams,
}: {
  player: EditablePlayer
  teams: TeamOption[]
}) {
  const [open, setOpen] = React.useState(false)
  const [playerType, setPlayerType] = React.useState<PlayerTypeValue>(
    player.type === "INTERNAL" ? "INTERNAL" : "EXTERNAL"
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await updatePlayerProfile(player.id, formData)
    } finally {
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-bg-secondary text-text-primary border border-border-dark hover:bg-accent-primary hover:text-primary-foreground hover:border-accent-primary transition-colors">
          Bewerken
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bewerk speler</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type speler */}
            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="block text-text-muted uppercase tracking-wider text-xs">
                Type speler
              </label>
              <input type="hidden" name="type" value={playerType} />
              <PlayerTypeToggle
                value={playerType}
                onChange={setPlayerType}
                size="sm"
              />
            </div>
  
            {/* Naam */}
            <div className="md:col-span-2">
              <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                Naam *
              </label>
              <input
                type="text"
                name="name"
                defaultValue={player.name}
                required
                className="w-full border border-border-dark rounded p-2 bg-background focus:border-accent-primary focus-visible:outline-none"
              />
            </div>
  
            <PlayerDobAgeFields
              initialDateOfBirth={
                player.dateOfBirth
                  ? new Date(player.dateOfBirth).toISOString().split("T")[0]
                  : ""
              }
              initialAge={player.age ?? null}
            />
  
            {playerType === "INTERNAL" ? (
              <>
                <div>
                  <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                    Team
                  </label>
                  <select
                    name="teamId"
                    defaultValue={player.teamId || ""}
                    className="w-full border border-border-dark rounded p-2 bg-background focus:border-accent-primary focus-visible:outline-none"
                  >
                    <option value=""></option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.code || team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                    Bij club sinds
                  </label>
                  <input
                    type="date"
                    name="joinedAt"
                    defaultValue={
                      player.joinedAt
                        ? new Date(player.joinedAt).toISOString().split("T")[0]
                        : ""
                    }
                    className="w-full border border-border-dark rounded p-2 bg-background focus:border-accent-primary focus-visible:outline-none"
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
                      player.contractEndDate
                        ? new Date(player.contractEndDate)
                            .toISOString()
                            .split("T")[0]
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
                    defaultValue={player.distanceFromClubKm ?? ""}
                    className="w-full border border-border-dark rounded p-2 bg-background focus-border-accent-primary focus-visible:outline-none"
                  />
                </div>
                <div className="flex items-center gap-5 pt-6 md:col-span-2">
                  <label className="text-sm text-text-secondary flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="optionYear"
                      defaultChecked={!!player.optionYear}
                    />
                    Option year
                  </label>
                  <label className="text-sm text-text-secondary flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isTopTalent"
                      defaultChecked={!!player.isTopTalent}
                    />
                    Top talent
                  </label>
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
                    defaultValue={player.currentClub || ""}
                    className="w-full border border-border-dark rounded p-2 bg-background focus:border-accent-primary focus-visible:outline-none"
                  />
                </div>
  
                <div>
                  <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                    Team
                  </label>
                  <input
                    type="text"
                    name="team"
                    defaultValue={player.team || ""}
                    className="w-full border border-border-dark rounded p-2 bg-background focus:border-accent-primary focus-visible:outline-none"
                  />
                </div>
              </>
            )}
  
            <div>
              <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                Niveau (Huidig)
              </label>
              <input
                type="text"
                name="niveau"
                defaultValue={player.niveau || ""}
                className="w-full border border-border-dark rounded p-2 bg-background focus:border-accent-primary focus-visible:outline-none"
              />
            </div>
  
            <div>
              <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                Beste positie
              </label>
              <input
                type="text"
                name="position"
                defaultValue={player.position || ""}
                className="w-full border border-border-dark rounded p-2 bg-background focus:border-accent-primary focus-visible:outline-none"
              />
            </div>
  
            <div>
              <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                Nevenpositie
              </label>
              <input
                type="text"
                name="secondaryPosition"
                defaultValue={player.secondaryPosition || ""}
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
                defaultValue={player.favoritePosition || ""}
                className="w-full border border-border-dark rounded p-2 bg-background focus-border-accent-primary focus-visible:outline-none"
              />
            </div>
  
            <div>
              <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                Voorkeursbeen
              </label>
              <select
                name="preferredFoot"
                defaultValue={player.preferredFoot || ""}
                className="w-full border border-border-dark rounded p-2 bg-background focus:border-accent-primary focus-visible:outline-none"
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
                defaultValue={player.contactPerson || ""}
                className="w-full border border-border-dark rounded p-2 bg-background focus:border-accent-primary focus-visible:outline-none"
              />
            </div>
  
            {playerType === "EXTERNAL" && (
              <>
                <div>
                  <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={player.status || ""}
                    className="w-full border border-border-dark rounded p-2 bg-background focus:border-accent-primary focus-visible:outline-none"
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
                    defaultValue={player.step || ""}
                    className="w-full border border-border-dark rounded p-2 bg-background focus:border-accent-primary focus-visible:outline-none"
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
                    defaultValue={player.advies || ""}
                    className="w-full border border-border-dark rounded p-2 bg-background focus:border-accent-primary focus-visible:outline-none"
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
          </div>
  
          <div>
            <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
              Korte Notities
            </label>
            <textarea
              name="notes"
              defaultValue={player.notes || ""}
              className="w-full border border-border-dark rounded p-2 bg-background focus:border-accent-primary focus-visible:outline-none"
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