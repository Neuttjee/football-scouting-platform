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
import { PlayerForm } from "./PlayerForm"

type TeamOption = {
  id: string
  name: string
  code: string | null
}

export function NewPlayerModal({ teams }: { teams: TeamOption[] }) {
  const [open, setOpen] = React.useState(false)

  const handleSubmit = async (fd: FormData) => {
    try {
      await createPlayer(fd)
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
        <PlayerForm
          mode="create"
          initialValues={{
            type: "EXTERNAL",
            name: "",
            dateOfBirth: null,
            age: null,
            currentClub: null,
            team: null,
            teamId: null,
            joinedAt: null,
            contractEndDate: null,
            distanceFromClubKm: null,
            isTopTalent: false,
            niveau: null,
            position: null,
            secondaryPosition: null,
            favoritePosition: null,
            preferredFoot: null,
            contactPerson: null,
            status: null,
            step: null,
            advies: null,
            notes: null,
          }}
          teams={teams}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}