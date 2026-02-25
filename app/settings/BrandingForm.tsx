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
        formData.set('logo', newBlob.url)
        setLogoUrl(newBlob.url)
      } catch (error) {
        console.error("Upload failed", error)
      } finally {
        setIsUploading(false)
      }
    } else {
      formData.set('logo', logoUrl)
    }

    await updateClubBranding(formData)
    alert("Branding opgeslagen!")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Club Logo</label>
        {logoUrl && (
          <div className="mb-2">
            <img src={logoUrl} alt="Club Logo" className="h-16 object-contain" />
          </div>
        )}
        <input type="file" name="logoFile" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Primaire Kleur</label>
          <div className="flex gap-4 items-center">
            <input type="color" name="primaryColor" defaultValue={club?.primaryColor || '#3b82f6'} className="h-10 w-full border rounded cursor-pointer" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Secundaire Kleur</label>
          <div className="flex gap-4 items-center">
            <input type="color" name="secondaryColor" defaultValue={club?.secondaryColor || '#1e40af'} className="h-10 w-full border rounded cursor-pointer" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tertiaire Kleur</label>
          <div className="flex gap-4 items-center">
            <input type="color" name="tertiaryColor" defaultValue={club?.tertiaryColor || '#ffffff'} className="h-10 w-full border rounded cursor-pointer" />
          </div>
        </div>
      </div>

      <button type="submit" disabled={isUploading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50">
        {isUploading ? 'Bezig met uploaden...' : 'Opslaan'}
      </button>
    </form>
  )
}
