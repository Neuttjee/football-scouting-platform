import type { ImportTargetField } from "./types";

export const playerTargetFieldsExternal: ImportTargetField[] = [
  { key: "name", label: "Naam", required: true, type: "string" },
  { key: "dateOfBirth", label: "Geboortedatum", type: "date" },
  { key: "position", label: "Positie", type: "string" },
  { key: "secondaryPosition", label: "Nevenpositie", type: "string" },
  { key: "preferredFoot", label: "Voorkeursbeen", type: "string" },
  { key: "currentClub", label: "Huidige club", type: "string" },
  { key: "team", label: "Team", type: "string" },
  { key: "niveau", label: "Niveau", type: "string" },
  { key: "status", label: "Status", type: "string" },
  { key: "step", label: "Processtap", type: "string" },
  { key: "advies", label: "Advies", type: "string" },
  { key: "notes", label: "Notities", type: "string" },
];

export const playerTargetFieldsInternal: ImportTargetField[] = [
  { key: "name", label: "Naam", required: true, type: "string" },
  { key: "dateOfBirth", label: "Geboortedatum", type: "date" },
  { key: "position", label: "Positie", type: "string" },
  { key: "secondaryPosition", label: "Nevenpositie", type: "string" },
  { key: "preferredFoot", label: "Voorkeursbeen", type: "string" },
  { key: "team", label: "Team", required: true, type: "string" },
  { key: "joinedAt", label: "Bij club sinds (datum)", type: "date" },
  { key: "contractEndDate", label: "Contract tot (datum)", type: "date" },
  { key: "distanceFromClubKm", label: "Afstand tot club (km)", type: "number" },
  { key: "optionYear", label: "Optiejaar (true/false)", type: "boolean" },
  { key: "notes", label: "Notities", type: "string" },
];

// Backwards compatible default
export const playerTargetFields: ImportTargetField[] = playerTargetFieldsExternal;

export const playerFieldAliases: Record<string, string[]> = {
  name: ["naam", "speler", "player", "player name", "full name"],
  dateOfBirth: [
    "geboortedatum",
    "dob",
    "birthdate",
    "date of birth",
    "geboorte datum",
  ],
  position: ["positie", "pos", "primary position", "main position"],
  secondaryPosition: ["nevenpositie", "secondary position", "secondary pos"],
  preferredFoot: ["voorkeursbeen", "foot", "preferred foot", "been"],
  currentClub: ["club", "huidige club", "current club"],
  team: ["team", "elftal", "squad"],
  niveau: ["niveau", "level", "league level"],
  status: ["status", "stap status", "state"],
  step: ["processtap", "step", "pipeline step"],
  advies: ["advies", "recommendation"],
  notes: ["notities", "notes", "commentaar", "comments"],
  joinedAt: ["bij club sinds", "joined at", "join date", "startdatum"],
  contractEndDate: ["contract tot", "contract end", "einde contract", "end date"],
  distanceFromClubKm: ["afstand", "afstand tot club", "distance", "km"],
  optionYear: ["optiejaar", "option year", "option"],
};

