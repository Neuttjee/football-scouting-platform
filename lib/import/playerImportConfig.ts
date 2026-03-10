import type { ImportTargetField } from "./types";

export const playerTargetFields: ImportTargetField[] = [
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
  { key: "type", label: "Type (INTERNAL/EXTERNAL)", type: "string" },
];

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
  type: ["type", "speler type", "player type", "internal/external"],
};

