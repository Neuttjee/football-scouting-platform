export type TeamOption = {
  id: string;
  name: string;
  code: string | null;
  displayOrder: number;
  isActive: boolean;
};

export type PlanningPlayer = {
  id: string;
  name: string;
  type: "INTERNAL" | "EXTERNAL";
  teamId: string | null;
  teamLabel: string | null;
  teamOrder: number;
  position: string | null;
  secondaryPosition: string | null;
  age: number | null;
  status: string | null;
  contractEndDate: string | null;
  isTopTalent: boolean;
};

export type Formation = "4-3-3" | "4-4-2";
export type MidfieldVariant = "POINT_BACK" | "POINT_FORWARD";

export type SlotLine = "GK" | "DEF" | "MID" | "FWD";

export type FieldSlot = {
  id: string;
  label: string;
  x: number;
  y: number;
  line: SlotLine;
};
