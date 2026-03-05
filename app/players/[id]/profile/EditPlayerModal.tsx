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
import { PlayerForm } from "../../PlayerForm";

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
        <PlayerForm
          mode="edit"
          initialValues={{
            id: player.id,
            name: player.name,
            type: player.type,
            dateOfBirth: player.dateOfBirth,
            age: player.age,
            currentClub: player.currentClub,
            team: player.team,
            teamId: player.teamId,
            joinedAt: player.joinedAt,
            contractEndDate: player.contractEndDate,
            distanceFromClubKm: player.distanceFromClubKm,
            isTopTalent: player.isTopTalent,
            niveau: player.niveau,
            position: player.position,
            secondaryPosition: player.secondaryPosition,
            favoritePosition: player.favoritePosition,
            preferredFoot: player.preferredFoot,
            contactPerson: player.contactPerson,
            status: player.status,
            step: player.step,
            advies: player.advies,
            notes: player.notes,
          }}
          teams={teams}
          // clubName kun je doorgeven vanuit de page als je die beschikbaar maakt
          onSubmit={async (fd) => {
            await updatePlayerProfile(player.id, fd);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  )
}