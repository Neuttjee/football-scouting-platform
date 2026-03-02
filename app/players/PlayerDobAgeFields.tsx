"use client"

import * as React from "react"
import { calculateAgeFromISODateString } from "@/lib/age"

interface PlayerDobAgeFieldsProps {
  initialDateOfBirth?: string | null
  initialAge?: number | null
}

export function PlayerDobAgeFields({
  initialDateOfBirth = "",
  initialAge = null,
}: PlayerDobAgeFieldsProps) {
  const [dob, setDob] = React.useState(initialDateOfBirth || "")
  const [ageInput, setAgeInput] = React.useState(
    initialAge != null ? String(initialAge) : ""
  )

  // Voor bestaande spelers met al een DOB maar nog geen opgeslagen leeftijd:
  // vul het leeftijdveld eenmalig op basis van de geboortedatum.
  React.useEffect(() => {
    if (dob && !ageInput) {
      const derived = calculateAgeFromISODateString(dob)
      if (derived != null) {
        setAgeInput(String(derived))
      }
    }
  }, [dob, ageInput])

  const hasDob = !!dob

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDob(value)

    if (value) {
      const derived = calculateAgeFromISODateString(value)
      if (derived != null) {
        setAgeInput(String(derived))
      }
    }
  }

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (hasDob) return
    setAgeInput(e.target.value)
  }

  return (
    <>
      <div>
        <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
          Geboortedatum
        </label>
        <input
          type="date"
          name="dateOfBirth"
          value={dob}
          onChange={handleDobChange}
          className="w-full border border-border-dark rounded p-2 bg-background focus:border-accent-primary focus-visible:outline-none"
        />
      </div>
      <div>
        <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
          Leeftijd
        </label>
        <input
          type="number"
          name="age"
          value={ageInput}
          onChange={handleAgeChange}
          min={0}
          inputMode="numeric"
          readOnly={hasDob}
          className={`w-full border border-border-dark rounded p-2 focus:border-accent-primary focus-visible:outline-none ${
            hasDob
              ? "bg-bg-secondary text-text-muted"
              : "bg-background text-text-primary"
          }`}
        />
      </div>
    </>
  )
}

