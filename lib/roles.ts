export const ROLES = [
  "SUPERADMIN",
  "ADMIN",
  "TC_LID",
  "SCOUT",
  "LEZER",
  "TRAINER",
] as const;

export type Role = (typeof ROLES)[number];

export function isAllowedRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function canEditSquadPlanning(role: unknown): boolean {
  return role === "SUPERADMIN" || role === "ADMIN" || role === "TRAINER" || role === "TC_LID";
}
