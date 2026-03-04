"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { PlayersTable } from "./PlayersTable";
import { NewPlayerModal } from "./NewPlayerModal";
import InternalPlayersPage from "../internal-players/InternalPlayersPage";

type ExternalPlayer = {
  id: string;
  name: string;
  position: string | null;
  step: string | null;
  status: string | null;
  currentClub: string | null;
  team: string | null;
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
};

export function PlayersPageClient({
  externalPlayers,
  internalPlayers,
  teams,
  clubUsers,
  agingThreshold,
  defaultSeasonYear,
}: Props) {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const [view, setView] = React.useState<"external" | "internal">(
    viewParam === "internal" ? "internal" : "external"
  );

  React.useEffect(() => {
    if (viewParam === "internal") setView("internal");
    else if (viewParam === "external") setView("external");
  }, [viewParam]);

  const handleViewChange = (newView: "external" | "internal") => {
    setView(newView);
    const url = newView === "internal" ? "/players?view=internal" : "/players";
    window.history.replaceState(null, "", url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Spelers</h1>

        {/* Toggle Intern / Extern */}
        <div className="inline-flex items-center gap-2 rounded-full bg-bg-secondary/60 border border-border-dark p-1">
          <button
            type="button"
            onClick={() => handleViewChange("external")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
              view === "external"
                ? "bg-accent-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary-rgb,255,106,0),0.4)]"
                : "text-text-muted hover:text-text-primary hover:bg-bg-primary/60"
            )}
          >
            Extern
          </button>
          <button
            type="button"
            onClick={() => handleViewChange("internal")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
              view === "internal"
                ? "bg-accent-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary-rgb,255,106,0),0.4)]"
                : "text-text-muted hover:text-text-primary hover:bg-bg-primary/60"
            )}
          >
            Intern
          </button>
        </div>
      </div>

      {view === "external" && (
        <>
          <div className="flex justify-end">
            <NewPlayerModal teams={teams} />
          </div>
          <PlayersTable data={externalPlayers as any} clubUsers={clubUsers} />
        </>
      )}

      {view === "internal" && (
        <InternalPlayersPage
          players={internalPlayers}
          teams={teams}
          agingThreshold={agingThreshold}
          defaultSeasonYear={defaultSeasonYear}
        />
      )}
    </div>
  );
}