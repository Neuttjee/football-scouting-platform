"use client"

import * as React from "react"
import { useState } from "react"
import { updateClubBranding } from "./actions"

export function BrandingForm({ club }: { club: any }) {
  const [isUploading, setIsUploading] = useState(false)
  const [logoUrl, setLogoUrl] = useState(club?.logo || "")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const fileInput = e.currentTarget.elements.namedItem('logoFile') as HTMLInputElement
    const file = fileInput?.files?.[0]

    if (file) {
      setIsUploading(true)
      try {
        const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
          method: 'POST',
          body: file,
        })
        const newBlob = await response.json()
        
        if (!response.ok) {
          alert(`Upload mislukt: ${newBlob.error || 'Onbekende fout'}`)
          setIsUploading(false)
          return
        }

        formData.set('logo', newBlob.url)
        setLogoUrl(newBlob.url)
      } catch (error) {
        console.error("Upload failed", error)
        alert("Er is iets misgegaan bij het uploaden.")
        setIsUploading(false)
        return
      } finally {
        setIsUploading(false)
      }
    } else {
      formData.set('logo', logoUrl)
    }

    await updateClubBranding(formData)
    alert("Branding opgeslagen!")
  }

  const handleRemoveLogo = async () => {
    if (confirm("Weet je zeker dat je het logo wilt verwijderen?")) {
      setLogoUrl("");
      const formData = new FormData();
      const primaryColorInput = document.querySelector('input[name="primaryColor"]') as HTMLInputElement;
      formData.set("primaryColor", primaryColorInput?.value || club?.primaryColor || "#FF6A00");
      formData.set("logo", ""); // Empty string to clear
      await updateClubBranding(formData);
      alert("Logo verwijderd!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-8">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Club Logo</label>
          <div className="flex items-start gap-4">
            {logoUrl ? (
              <div className="flex flex-col items-start gap-2">
                <div className="bg-bg-secondary p-2 rounded-lg border border-border-dark">
                  <img src={logoUrl} alt="Club Logo" className="h-16 object-contain" />
                </div>
                <button 
                  type="button" 
                  onClick={handleRemoveLogo}
                  className="text-xs text-red-500 hover:text-red-400 transition"
                >
                  Verwijder logo
                </button>
              </div>
            ) : (
              <div className="h-20 w-20 bg-bg-secondary border border-border-dark border-dashed rounded-lg flex items-center justify-center text-xs text-text-muted">
                Geen logo
              </div>
            )}
            <div className="flex-1">
              <input type="file" name="logoFile" accept="image/*" className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-accent-primary/10 file:text-accent-primary hover:file:bg-accent-primary/20 cursor-pointer" />
              <p className="text-xs text-text-muted mt-2">Aanbevolen: PNG met transparante achtergrond.</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Primaire Kleur</label>
          <div className="flex gap-4 items-center">
            <input type="color" name="primaryColor" defaultValue={club?.primaryColor || '#FF6A00'} className="h-10 w-full max-w-[100px] border-0 rounded cursor-pointer bg-transparent" />
            <span className="text-sm text-text-muted">Wordt gebruikt voor knoppen, actieve menu-items en accenten.</span>
          </div>
        </div>
      </div>

      <button type="submit" disabled={isUploading} className="bg-accent-primary text-white px-6 py-2 rounded hover:bg-accent-glow transition disabled:opacity-50 font-medium">
        {isUploading ? 'Bezig met uploaden...' : 'Branding Opslaan'}
      </button>
    </form>
  )
}
