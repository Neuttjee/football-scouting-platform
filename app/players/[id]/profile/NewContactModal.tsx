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
import { createContact } from "../contacts/actions"
import { Plus } from "lucide-react"
import { ContactForm } from "@/app/contacts/ContactForm"

export function NewContactModal({
  playerId,
  playerName,
}: {
  playerId: string
  playerName: string
}) {
  const [open, setOpen] = React.useState(false)

  const handleSubmit = async (fd: FormData) => {
    fd.set("playerId", playerId)
    await createContact(playerId, fd)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="p-1.5 bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 rounded-md transition-colors outline-none cursor-pointer focus:ring-accent-primary focus:ring-1 focus:ring-offset-2"
          aria-label="Nieuw contactmoment toevoegen"
        >
          <Plus className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-bg-card border-accent-primary text-text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Nieuw contactmoment</DialogTitle>
        </DialogHeader>
        <ContactForm
          initialPlayer={{ id: playerId, name: playerName }}
          lockPlayer={true}
          onSubmit={handleSubmit}
          submitLabel="Opslaan"
        />
      </DialogContent>
    </Dialog>
  )
}