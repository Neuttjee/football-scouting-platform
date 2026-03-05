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
import { createTask } from "./actions"
import { TaskForm } from "./TaskForm"

export function NewTaskModal({ clubUsers }: { clubUsers: any[] }) {
  const [open, setOpen] = React.useState(false)

  const handleSubmit = async (fd: FormData) => {
    await createTask(fd)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-premium text-white transition">
          Taak toevoegen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl bg-bg-card border-accent-primary text-text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Nieuwe taak</DialogTitle>
        </DialogHeader>
        <TaskForm clubUsers={clubUsers} onSubmit={handleSubmit} submitLabel="Opslaan" />
      </DialogContent>
    </Dialog>
  )
}