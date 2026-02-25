"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

export function InviteUserModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as string

    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Er is een fout opgetreden')
      }

      setOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-premium text-white transition">
          Gebruiker Uitnodigen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nieuwe Gebruiker Uitnodigen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">Naam</label>
            <input type="text" name="name" required className="w-full border rounded p-2 bg-background" placeholder="Naam van de gebruiker" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">E-mailadres</label>
            <input type="email" name="email" required className="w-full border rounded p-2 bg-background" placeholder="e-mail@voorbeeld.nl" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Rol</label>
            <select name="role" required className="w-full border rounded p-2 bg-background">
              <option value="SCOUT">Scout</option>
              <option value="TC_LID">TC Lid</option>
              <option value="ADMIN">Beheerder (Admin)</option>
              <option value="LEZER">Lezer</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={loading} className="btn-premium text-white transition">
              {loading ? 'Bezig met uitnodigen...' : 'Uitnodiging Versturen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}