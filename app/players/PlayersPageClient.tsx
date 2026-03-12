"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { PlayersTable } from "./PlayersTable";
import { NewPlayerModal } from "./NewPlayerModal";
import InternalPlayersPage from "../internal-players/InternalPlayersPage";
import { PlayerTypeToggle, PlayerTypeValue } from "@/components/PlayerTypeToggle";

type ExternalPlayer = {
  id: string;
  name: string;
  position: string | null;
  step: string | null;
  status: string | null;
  currentClub: string | null;
  team: string | null;
  niveau: string | null;
  secondaryPosition: string | null;
  preferredFoot: string | null;
  dateOfBirth: Date | null;
  age: number | null;
  advies: string | null;
  notes: string | null;
};

type InternalPlayer = {
  id: string;
  name: string;
  teamId: string | null;
  teamLabel: string | null;
  originTeamLabel: string | null;
  position: string | null;
  secondaryPosition: string | null;
  favoritePosition: string | null;
  preferredFoot: string | null;
  age: number | null;
  joinedAt: Date | null;
  contractEndDate: Date | null;
  isTopTalent: boolean;
  distanceFromClubKm: number | null;
};

type TeamOption = {
  id: string;
  name: string;
  code: string | null;
  niveau?: string | null;
};

type ClubUser = {
  id: string;
  name: string;
};

type Props = {
  externalPlayers: ExternalPlayer[];
  internalPlayers: InternalPlayer[];
  teams: TeamOption[];
  clubUsers: ClubUser[];
  agingThreshold: number;
  defaultSeasonYear: number;
  clubName: string | null;
  canBulkDelete: boolean;
};

export function PlayersPageClient({
  externalPlayers,
  internalPlayers,
  teams,
  clubUsers,
  agingThreshold,
  defaultSeasonYear,
  clubName,
  canBulkDelete,
}: Props) {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");

  const [view, setView] = React.useState<PlayerTypeValue>(
    viewParam === "internal" ? "INTERNAL" : "EXTERNAL"
  );

  const handleViewChange = (newView: PlayerTypeValue) => {
    setView(newView);
    const url = newView === "INTERNAL" ? "/players?view=internal" : "/players";
    window.history.replaceState(null, "", url);
  };

  React.useEffect(() => {
    if (viewParam === "internal") setView("INTERNAL");
    else if (viewParam === "external") setView("EXTERNAL");
  }, [viewParam]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Links: titel */}
        <div className="justify-self-start">
          <h1 className="text-3xl font-bold">Spelers</h1>
        </div>

        {/* Midden: Intern/Extern toggle */}
        <div className="justify-self-center">
          <PlayerTypeToggle value={view} onChange={handleViewChange} size="sm" />
        </div>

        {/* Rechts: nieuwe speler button in beide views */}
        <div className="justify-self-end">
          <NewPlayerModal teams={teams} clubName={clubName} />
        </div>
      </div>

      {view === "EXTERNAL" && (
        <PlayersTable
          data={externalPlayers as any}
          clubUsers={clubUsers}
          clubName={clubName}
          canBulkDelete={canBulkDelete}
        />
      )}

      {view === "INTERNAL" && (
        <InternalPlayersPage
          players={internalPlayers}
          teams={teams}
          agingThreshold={agingThreshold}
          defaultSeasonYear={defaultSeasonYear}
          clubUsers={clubUsers}
          clubName={clubName}
          canBulkDelete={canBulkDelete}
        />
      )}
    </div>
  );
}