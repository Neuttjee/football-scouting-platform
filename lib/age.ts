export function calculateAgeFromDate(dob: Date, today: Date = new Date()): number {
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age
}

export function calculateAgeFromISODateString(
  dobStr: string,
  today: Date = new Date()
): number | null {
  if (!dobStr) return null
  const dob = new Date(`${dobStr}T00:00:00`)
  if (isNaN(dob.getTime())) return null
  return calculateAgeFromDate(dob, today)
}

