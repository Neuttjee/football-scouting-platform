"use client";

import * as React from "react";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { Field } from "./Field";
import { PlayerPicker } from "./PlayerPicker";
import { FieldSlot, Formation, MidfieldVariant, PlanningPlayer, TeamOption } from "./types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TeamSettingsForm } from "../settings/TeamSettingsForm";

function getSlots(formation: Formation, midfieldVariant: MidfieldVariant): FieldSlot[] {
  if (formation === "4-4-2") {
    return [
      { id: "GK", label: "Keeper", x: 50, y: 92, line: "GK" },
      { id: "RB", label: "Rechtsback", x: 78, y: 76, line: "DEF" },
      { id: "RCB", label: "Rechter CV", x: 60, y: 76, line: "DEF" },
      { id: "LCB", label: "Linker CV", x: 40, y: 76, line: "DEF" },
      { id: "LB", label: "Linksback", x: 22, y: 76, line: "DEF" },
      { id: "RM", label: "Rechtsmidden", x: 78, y: 55, line: "MID" },
      { id: "CMR", label: "CM rechts", x: 58, y: 55, line: "MID" },
      { id: "CML", label: "CM links", x: 42, y: 55, line: "MID" },
      { id: "LM", label: "Linksmidden", x: 22, y: 55, line: "MID" },
      { id: "ST1", label: "Spits 1", x: 42, y: 30, line: "FWD" },
      { id: "ST2", label: "Spits 2", x: 58, y: 30, line: "FWD" },
    ];
  }

  const midfield: FieldSlot[] =
    midfieldVariant === "POINT_BACK"
      ? [
          { id: "DM", label: "Controlerende 6", x: 50, y: 60, line: "MID" },
          { id: "AMR", label: "8/10 rechts", x: 62, y: 47, line: "MID" },
          { id: "AML", label: "8/10 links", x: 38, y: 47, line: "MID" },
        ]
      : [
          { id: "DMR", label: "6 rechts", x: 58, y: 58, line: "MID" },
          { id: "DML", label: "6 links", x: 42, y: 58, line: "MID" },
          { id: "AM", label: "10", x: 50, y: 44, line: "MID" },
        ];

  return [
    { id: "GK", label: "Keeper", x: 50, y: 92, line: "GK" },
    { id: "RB", label: "Rechtsback", x: 78, y: 76, line: "DEF" },
    { id: "RCB", label: "Rechter CV", x: 60, y: 76, line: "DEF" },
    { id: "LCB", label: "Linker CV", x: 40, y: 76, line: "DEF" },
    { id: "LB", label: "Linksback", x: 22, y: 76, line: "DEF" },
    ...midfield,
    { id: "RW", label: "Rechtsbuiten", x: 78, y: 28, line: "FWD" },
    { id: "ST", label: "Spits", x: 50, y: 24, line: "FWD" },
    { id: "LW", label: "Linksbuiten", x: 22, y: 28, line: "FWD" },
  ];
}

function addToSlot(assignments: Record<string, string[]>, slotId: string, playerId: string) {
  const current = assignments[slotId] || [];
  if (current.includes(playerId)) return assignments;
  const next = [...current];
  if (next.length < 3) {
    next.push(playerId);
  } else {
    next[2] = playerId;
  }
  return { ...assignments, [slotId]: next };
}

export default function SquadPlanningPage({
  players,
  teams,
  agingThreshold,
  defaultSeasonYear,
}: {
  players: PlanningPlayer[];
  teams: TeamOption[];
  agingThreshold: number;
  defaultSeasonYear: number;
}) {
  const [selectedTeamId, setSelectedTeamId] = React.useState<string | null>(teams[0]?.id ?? null);
  const [includeFeederTeams, setIncludeFeederTeams] = React.useState(true);
  const [selectedType, setSelectedType] = React.useState<"INTERNAL" | "EXTERNAL">("INTERNAL");
  const [seasonYear, setSeasonYear] = React.useState(defaultSeasonYear);
  const [formation, setFormation] = React.useState<Formation>("4-3-3");
  const [midfieldVariant, setMidfieldVariant] = React.useState<MidfieldVariant>("POINT_BACK");
  const slots = React.useMemo(() => getSlots(formation, midfieldVariant), [formation, midfieldVariant]);
  const [assignments, setAssignments] = React.useState<Record<string, string[]>>({});
  const [pendingDrop, setPendingDrop] = React.useState<{
    playerId: string;
    targetSlotId: string;
  } | null>(null);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  React.useEffect(() => {
    setAssignments((prev) => {
      const next: Record<string, string[]> = {};
      slots.forEach((slot) => {
        next[slot.id] = prev[slot.id] || [];
      });
      return next;
    });
  }, [slots]);

  const teamsById = React.useMemo(
    () => Object.fromEntries(teams.map((team) => [team.id, team])),
    [teams]
  );
  const selectedTeamOrder = selectedTeamId ? teamsById[selectedTeamId]?.displayOrder ?? 999 : 999;

  const filteredPlayers = React.useMemo(() => {
    return players.filter((player) => {
      if (player.type === "EXTERNAL") return true;
      if (!selectedTeamId) return true;
      if (!includeFeederTeams) return player.teamId === selectedTeamId;
      return player.teamOrder >= selectedTeamOrder;
    });
  }, [players, selectedTeamId, includeFeederTeams, selectedTeamOrder]);

  const playersById = React.useMemo(
    () => Object.fromEntries(filteredPlayers.map((player) => [player.id, player])),
    [filteredPlayers]
  );

  const assignedEntries = Object.entries(assignments).flatMap(([slotId, ids]) =>
    ids.map((id) => ({ slotId, id }))
  );
  const duplicatePlayerIds = new Set(
    Object.entries(
      assignedEntries.reduce<Record<string, number>>((acc, entry) => {
        acc[entry.id] = (acc[entry.id] ?? 0) + 1;
        return acc;
      }, {})
    )
      .filter(([, count]) => count > 1)
      .map(([id]) => id)
  );

  const handleDrop = (slotId: string, playerId: string) => {
    const currentSlots = Object.entries(assignments)
      .filter(([, ids]) => ids.includes(playerId))
      .map(([id]) => id);

    if (currentSlots.length > 0 && !currentSlots.includes(slotId)) {
      setPendingDrop({ playerId, targetSlotId: slotId });
      return;
    }

    setAssignments((prev) => addToSlot(prev, slotId, playerId));
  };

  const applyMove = (mode: "move" | "duplicate") => {
    if (!pendingDrop) return;
    const { playerId, targetSlotId } = pendingDrop;
    setAssignments((prev) => {
      let next = { ...prev };
      if (mode === "move") {
        Object.keys(next).forEach((slotId) => {
          next[slotId] = (next[slotId] || []).filter((id) => id !== playerId);
        });
      }
      next = addToSlot(next, targetSlotId, playerId);
      return next;
    });
    setPendingDrop(null);
  };

  const removeFromSlot = (slotId: string, playerId: string) => {
    setAssignments((prev) => ({
      ...prev,
      [slotId]: (prev[slotId] || []).filter((id) => id !== playerId),
    }));
  };

  const seasonOptions = React.useMemo(
    () => Array.from({ length: 8 }, (_, idx) => defaultSeasonYear + idx),
    [defaultSeasonYear]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Linkerzijde: teamselectie + filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-bg-secondary/60 border border-border-dark p-1">
            {teams.map((team) => {
              const active = team.id === selectedTeamId;
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => setSelectedTeamId(team.id)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                    active
                      ? "bg-accent-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary-rgb,255,106,0),0.4)]"
                      : "text-text-muted hover:text-text-primary hover:bg-bg-primary/60"
                  )}
                >
                  {team.code || team.name}
                </button>
              );
            })}
          </div>

          <select
            value={seasonYear}
            onChange={(e) => setSeasonYear(parseInt(e.target.value, 10))}
            className="border border-border-dark rounded px-2 py-1 text-xs bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
          >
            {seasonOptions.map((year) => (
              <option key={year} value={year}>
                {year}-{year + 1}
              </option>
            ))}
          </select>

          <select
            value={formation}
            onChange={(e) => setFormation(e.target.value as Formation)}
            className="border border-border-dark rounded px-2 py-1 text-xs bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
          >
            <option value="4-3-3">4-3-3</option>
            <option value="4-4-2">4-4-2</option>
          </select>

          {formation === "4-3-3" && (
            <select
              value={midfieldVariant}
              onChange={(e) => setMidfieldVariant(e.target.value as MidfieldVariant)}
              className="border border-border-dark rounded px-2 py-1 text-xs bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
            >
              <option value="POINT_BACK">POINT_BACK</option>
              <option value="POINT_FORWARD">POINT_FORWARD</option>
            </select>
          )}

          <label className="text-xs text-text-muted flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeFeederTeams}
              onChange={(e) => setIncludeFeederTeams(e.target.checked)}
            />
            Onderliggende teams meenemen
          </label>
        </div>

        {/* Rechterzijde: planning instellingen dialoog */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border-dark text-xs text-text-secondary hover:text-text-primary hover:bg-bg-primary/60"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Planning instellingen</span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-bg-card border-accent-primary text-text-primary">
            <DialogHeader>
              <DialogTitle>Planning instellingen</DialogTitle>
            </DialogHeader>
            <TeamSettingsForm teams={teams} agingThreshold={agingThreshold} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_390px] gap-6">
        <Field
          slots={slots}
          assignments={assignments}
          playersById={playersById}
          seasonYear={seasonYear}
          agingThreshold={agingThreshold}
          selectedTeamOrder={selectedTeamOrder}
          duplicatePlayerIds={duplicatePlayerIds}
          onDropPlayer={handleDrop}
          onRemoveFromSlot={removeFromSlot}
        />

        <PlayerPicker
          players={filteredPlayers}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
      </div>

      <AnalyticsPanel
        slots={slots}
        assignments={assignments}
        playersById={playersById}
        seasonYear={seasonYear}
        agingThreshold={agingThreshold}
      />

      {pendingDrop && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-dark rounded-xl p-5 w-full max-w-md">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Speler is al geplaatst</h3>
            <p className="text-sm text-text-muted mb-4">
              Wil je deze speler verplaatsen of dubbel gebruiken?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary"
                onClick={() => setPendingDrop(null)}
              >
                Annuleren
              </button>
              <button
                type="button"
                className="px-3 py-1.5 text-sm rounded border border-border-dark text-text-primary"
                onClick={() => applyMove("move")}
              >
                Verplaatsen
              </button>
              <button
                type="button"
                className="px-3 py-1.5 text-sm rounded bg-accent-primary text-primary-foreground"
                onClick={() => applyMove("duplicate")}
              >
                Dubbel gebruiken
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
