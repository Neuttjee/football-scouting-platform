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

export function NewPlayerModal({ teams, clubName }: { teams: TeamOption[]; clubName: string | null }) {
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (fd: FormData) => {
    setError(null)
    try {
      await createPlayer(fd)
      setOpen(false)
    } catch (e) {
      // Next.js redirect() gooit een error; die doorlaten zodat de redirect werkt
      const digest = e && typeof e === "object" && "digest" in e ? String((e as { digest?: string }).digest) : ""
      if (digest.startsWith("NEXT_REDIRECT")) throw e
      const message = e instanceof Error ? e.message : "Er is iets misgegaan. Probeer het opnieuw."
      setError(message)
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) setError(null)
    setOpen(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="btn-premium text-white transition">
          Speler toevoegen
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-2xl max-h-[85vh] overflow-y-auto bg-bg-card border-accent-primary text-text-primary"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-text-primary">Speler toevoegen</DialogTitle>
        </DialogHeader>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded p-2">
            {error}
          </p>
        )}
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
          clubName={clubName}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}