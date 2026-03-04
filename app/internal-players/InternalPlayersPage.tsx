// app/internal-players/InternalPlayersPage.tsx
"use client";

import * as React from "react";
import { InternalPlayersTable } from "./InternalPlayersTable";

type InternalPlayer = {
  id: string;
  name: string;
  teamId: string | null;
  teamLabel: string | null;
  originTeamLabel: string | null;
  position: string | null;
  secondaryPosition: string | null;
  preferredFoot: string | null;
  age: number | null;
  joinedAt: Date | null;
  contractEndDate: Date | null;
  isTopTalent: boolean;
};

type TeamOption = {
  id: string;
  name: string;
  code: string | null;
};

type Props = {
  players: InternalPlayer[];
  teams: TeamOption[];
  agingThreshold: number;
  defaultSeasonYear: number;
  clubUsers: { id: string; name: string }[];
};

export default function InternalPlayersPage({
  players,
  teams,
  agingThreshold,
  defaultSeasonYear,
  clubUsers,
}: Props) {
  return (
    <div className="space-y-6">
      <InternalPlayersTable
        players={players}
        agingThreshold={agingThreshold}
        seasonYear={defaultSeasonYear}
        clubUsers={clubUsers}
      />
    </div>
  );
}