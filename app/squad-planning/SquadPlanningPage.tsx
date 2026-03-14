"use client";

import * as React from "react";
import { Settings, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { Field } from "./Field";
import { PlayerPicker } from "./PlayerPicker";
import { FieldSlot, Formation, PlanningPlayer, TeamOption } from "./types";
import { PlayerTypeToggle, PlayerTypeValue } from "@/components/PlayerTypeToggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TeamSettingsForm } from "../settings/TeamSettingsForm";

const DEF_SLOTS: FieldSlot[] = [
  { id: "GK", label: "Keeper", x: 50, y: 92, line: "GK" },
  { id: "RB", label: "Rechtsback", x: 80, y: 66, line: "DEF" },
  { id: "RCB", label: "Rechter CV", x: 65, y: 80, line: "DEF" },
  { id: "LCB", label: "Linker CV", x: 35, y: 80, line: "DEF" },
  { id: "LB", label: "Linksback", x: 20, y: 66, line: "DEF" },
];

const FWD_EXTRA_SLOTS = 3;

function getSlots(formation: Formation): FieldSlot[] {
  if (formation === "4-4-2_DIAMOND") {
    return [
      ...DEF_SLOTS,
      { id: "RM", label: "Rechtsmidden", x: 74, y: 46, line: "MID" },
      { id: "DM", label: "Controlerende 6", x: 50, y: 60, line: "MID" },
      { id: "LM", label: "Linksmidden", x: 26, y: 46, line: "MID" },
      { id: "AM", label: "10", x: 50, y: 32, line: "MID" },
      { id: "ST1", label: "Spits 1", x: 35, y: 20, line: "FWD", maxPlayers: FWD_EXTRA_SLOTS },
      { id: "ST2", label: "Spits 2", x: 65, y: 20, line: "FWD", maxPlayers: FWD_EXTRA_SLOTS },
    ];
  }
  if (formation === "4-4-2_SQUARE") {
    return [
      ...DEF_SLOTS,
      { id: "RM", label: "Rechtsmidden", x: 68, y: 42, line: "MID" },
      { id: "CMR", label: "CM rechts", x: 68, y: 54, line: "MID" },
      { id: "CML", label: "CM links", x: 32, y: 54, line: "MID" },
      { id: "LM", label: "Linksmidden", x: 32, y: 42, line: "MID" },
      { id: "ST1", label: "Spits 1", x: 35, y: 20, line: "FWD", maxPlayers: FWD_EXTRA_SLOTS },
      { id: "ST2", label: "Spits 2", x: 65, y: 20, line: "FWD", maxPlayers: FWD_EXTRA_SLOTS },
    ];
  }
  if (formation === "4-3-3_POINT_FORWARD") {
    return [
      ...DEF_SLOTS,
      { id: "DMR", label: "6 rechts", x: 65, y: 54, line: "MID" },
      { id: "DML", label: "6 links", x: 35, y: 54, line: "MID" },
      { id: "AM", label: "10", x: 50, y: 40, line: "MID" },
      { id: "RW", label: "Rechtsbuiten", x: 78, y: 18, line: "FWD", maxPlayers: FWD_EXTRA_SLOTS },
      { id: "ST", label: "Spits", x: 50, y: 14, line: "FWD", maxPlayers: FWD_EXTRA_SLOTS },
      { id: "LW", label: "Linksbuiten", x: 22, y: 18, line: "FWD", maxPlayers: FWD_EXTRA_SLOTS },
    ];
  }
  // 4-3-3_POINT_BACK
  return [
    ...DEF_SLOTS,
    { id: "DM", label: "Controlerende 6", x: 50, y: 56, line: "MID" },
    { id: "AMR", label: "8/10 rechts", x: 65, y: 43, line: "MID" },
    { id: "AML", label: "8/10 links", x: 35, y: 43, line: "MID" },
    { id: "RW", label: "Rechtsbuiten", x: 78, y: 18, line: "FWD", maxPlayers: FWD_EXTRA_SLOTS },
    { id: "ST", label: "Spits", x: 50, y: 14, line: "FWD", maxPlayers: FWD_EXTRA_SLOTS },
    { id: "LW", label: "Linksbuiten", x: 22, y: 18, line: "FWD", maxPlayers: FWD_EXTRA_SLOTS },
  ];
}

const DEFAULT_MAX_PLAYERS_PER_SLOT = 2;
const MAX_SLOT_CAP = 5;

function addToSlot(
  assignments: Record<string, string[]>,
  slotId: string,
  playerId: string,
  maxForSlot: number = DEFAULT_MAX_PLAYERS_PER_SLOT
) {
  const current = assignments[slotId] || [];
  if (current.includes(playerId)) return assignments;
  const next = [...current];
  if (next.length < maxForSlot) {
    next.push(playerId);
  } else {
    next[maxForSlot - 1] = playerId;
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
  const [selectedType, setSelectedType] = React.useState<PlayerTypeValue>("INTERNAL");
  const [seasonYear, setSeasonYear] = React.useState(defaultSeasonYear);
  const [formation, setFormation] = React.useState<Formation>("4-3-3_POINT_BACK");
  const slots = React.useMemo(() => getSlots(formation), [formation]);
  const [assignments, setAssignments] = React.useState<Record<string, string[]>>({});
  const [pendingDrop, setPendingDrop] = React.useState<{
    playerId: string;
    targetSlotId: string;
  } | null>(null);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [analyticsOpen, setAnalyticsOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [slotMaxOverrides, setSlotMaxOverrides] = React.useState<Record<string, number>>({});

  const assignmentsRef = React.useRef<Record<string, string[]>>({});
  const formationRef = React.useRef<Formation>(formation);
  const slotMaxOverridesRef = React.useRef<Record<string, number>>({});
  const currentKeyRef = React.useRef<{ teamId: string | null; seasonYear: number }>({
    teamId: selectedTeamId,
    seasonYear,
  });
  const previousKeyRef = React.useRef<{ teamId: string | null; seasonYear: number } | null>(null);

  React.useEffect(() => {
    assignmentsRef.current = assignments;
  }, [assignments]);

  React.useEffect(() => {
    slotMaxOverridesRef.current = slotMaxOverrides;
  }, [slotMaxOverrides]);

  React.useEffect(() => {
    formationRef.current = formation;
  }, [formation]);

  React.useEffect(() => {
    currentKeyRef.current = { teamId: selectedTeamId, seasonYear };
  }, [selectedTeamId, seasonYear]);

  const savePlan = React.useCallback(
    async (
      teamId: string,
      seasonYearToSave: number,
      formationToSave: Formation,
      assignmentsToSave: Record<string, string[]>,
      slotMaxOverridesToSave: Record<string, number>
    ) => {
      try {
        setIsSaving(true);
        const res = await fetch("/api/squad-planning/plan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teamId,
            seasonYear: seasonYearToSave,
            formation: formationToSave,
            assignments: assignmentsToSave,
            slotMaxOverrides: slotMaxOverridesToSave,
            isClubDefault: false,
          }),
        });

        if (!res.ok) {
          console.error("Failed to save squad plan", await res.text());
          return;
        }

        setLastSavedAt(new Date());
      } catch (error) {
        console.error("Error saving squad plan", error);
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

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

  const effectiveMaxBySlotId = React.useMemo(() => {
    const map: Record<string, number> = {};
    slots.forEach((slot) => {
      map[slot.id] = slotMaxOverrides[slot.id] ?? slot.maxPlayers ?? DEFAULT_MAX_PLAYERS_PER_SLOT;
    });
    return map;
  }, [slots, slotMaxOverrides]);

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

    setAssignments((prev) =>
        addToSlot(prev, slotId, playerId, effectiveMaxBySlotId[slotId] ?? DEFAULT_MAX_PLAYERS_PER_SLOT)
      );
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
      next = addToSlot(
        next,
        targetSlotId,
        playerId,
        effectiveMaxBySlotId[targetSlotId] ?? DEFAULT_MAX_PLAYERS_PER_SLOT
      );
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

  const getBaseMaxForSlot = (slotId: string) =>
    slots.find((s) => s.id === slotId)?.maxPlayers ?? DEFAULT_MAX_PLAYERS_PER_SLOT;

  const handleSlotMaxIncrease = (slotId: string) => {
    const base = getBaseMaxForSlot(slotId);
    setSlotMaxOverrides((prev) => {
      const current = prev[slotId] ?? base;
      if (current >= MAX_SLOT_CAP) return prev;
      const next = { ...prev, [slotId]: current + 1 };
      if (selectedTeamId) {
        void savePlan(selectedTeamId, seasonYear, formationRef.current, assignmentsRef.current, next);
      }
      return next;
    });
  };

  const handleSlotMaxDecrease = (slotId: string) => {
    const base = getBaseMaxForSlot(slotId);
    setSlotMaxOverrides((prev) => {
      const current = prev[slotId] ?? base;
      if (current <= base) return prev;
      const assigned = assignments[slotId]?.length ?? 0;
      const nextMax = current - 1;
      if (assigned > nextMax) return prev;
      const next = { ...prev, [slotId]: nextMax };
      const nextOverrides = nextMax === base ? (() => { const { [slotId]: _, ...rest } = next; return rest; })() : next;
      if (selectedTeamId) {
        void savePlan(selectedTeamId, seasonYear, formationRef.current, assignmentsRef.current, nextOverrides);
      }
      return nextOverrides;
    });
  };

  const seasonOptions = React.useMemo(
    () => Array.from({ length: 8 }, (_, idx) => defaultSeasonYear + idx),
    [defaultSeasonYear]
  );

  // Auto-save bij wisselen van team of seizoen (oude selectie wegschrijven)
  React.useEffect(() => {
    const previous = previousKeyRef.current;
    if (
      previous &&
      previous.teamId &&
      (previous.teamId !== selectedTeamId || previous.seasonYear !== seasonYear)
    ) {
      void savePlan(
        previous.teamId,
        previous.seasonYear,
        formationRef.current,
        assignmentsRef.current,
        slotMaxOverridesRef.current
      );
    }
    previousKeyRef.current = { teamId: selectedTeamId, seasonYear };
  }, [selectedTeamId, seasonYear, savePlan]);

  // Auto-save bij unmounten van de pagina (laatste versie bewaren)
  React.useEffect(() => {
    return () => {
      const { teamId, seasonYear: seasonYearToSave } = currentKeyRef.current;
      if (!teamId) return;
      void savePlan(
        teamId,
        seasonYearToSave,
        formationRef.current,
        assignmentsRef.current,
        slotMaxOverridesRef.current
      );
    };
  }, [savePlan]);

  // Laad bestaande opstelling bij initialisatie / wisselen team of seizoen
  React.useEffect(() => {
    const loadPlan = async () => {
      if (!selectedTeamId) return;
      try {
        setLoadError(null);
        const params = new URLSearchParams({
          teamId: selectedTeamId,
          seasonYear: String(seasonYear),
        });
        const res = await fetch(`/api/squad-planning/plan?${params.toString()}`);
        if (!res.ok) {
          console.error("Failed to load squad plan", await res.text());
          return;
        }
        const data = await res.json();
        if (data?.plan) {
          if (data.plan.formation && data.plan.formation !== formation) {
            setFormation(data.plan.formation as Formation);
          }
          if (data.plan.assignments && typeof data.plan.assignments === "object") {
            setAssignments(data.plan.assignments as Record<string, string[]>);
          }
          if (data.plan.slotMaxOverrides && typeof data.plan.slotMaxOverrides === "object") {
            setSlotMaxOverrides(data.plan.slotMaxOverrides as Record<string, number>);
          } else {
            setSlotMaxOverrides({});
          }
        } else {
          setSlotMaxOverrides({});
        }
      } catch (error) {
        console.error("Error loading squad plan", error);
        setLoadError("Opstelling kon niet geladen worden.");
      }
    };

    loadPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeamId, seasonYear]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Linkerzijde: teamselectie + filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1 rounded-md bg-bg-secondary/80 border border-border-dark shadow-sm p-0.5">
            {teams.map((team) => {
              const active = team.id === selectedTeamId;
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => setSelectedTeamId(team.id)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                    active
                      ? "bg-accent-primary text-primary-foreground shadow-[0_0_8px_rgba(var(--primary-rgb,255,106,0),0.5)]"
                      : "text-text-muted hover:text-text-primary hover:bg-bg-primary/70"
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
            <option value="4-3-3_POINT_BACK">4-3-3 p.n.v.</option>
            <option value="4-3-3_POINT_FORWARD">4-3-3 p.n.a.</option>
            <option value="4-4-2_DIAMOND">4-4-2 ruit</option>
            <option value="4-4-2_SQUARE">4-4-2 vierkant</option>
          </select>

          <label className="text-xs text-text-muted flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeFeederTeams}
              onChange={(e) => setIncludeFeederTeams(e.target.checked)}
            />
            Onderliggende teams meenemen
          </label>
        </div>

        {/* Rechterzijde: analyse + planning instellingen */}
        <div className="flex items-center gap-2">
          <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border-dark text-xs text-text-secondary hover:text-text-primary hover:bg-bg-primary/60"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analyse</span>
              </button>
            </DialogTrigger>
            <DialogContent
              size="wide"
              className="max-h-[90vh] overflow-y-auto bg-bg-card border-accent-primary text-text-primary"
            >
              <DialogHeader>
                <DialogTitle>Selectie-analyse</DialogTitle>
              </DialogHeader>
              <AnalyticsPanel
                slots={slots}
                assignments={assignments}
                playersById={playersById}
                seasonYear={seasonYear}
                agingThreshold={agingThreshold}
                effectiveMaxBySlotId={effectiveMaxBySlotId}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border-dark text-xs text-text-secondary hover:text-text-primary hover:bg-bg-primary/60"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Instellingen</span>
              </button>
            </DialogTrigger>
            <DialogContent
              size="wide"
              className="max-h-[90vh] overflow-y-auto bg-bg-card border-accent-primary text-text-primary"
            >
              <DialogHeader>
                <DialogTitle>Instellingen</DialogTitle>
              </DialogHeader>
              <TeamSettingsForm teams={teams} agingThreshold={agingThreshold} />
            </DialogContent>
          </Dialog>
        </div>
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
          slotMaxOverrides={slotMaxOverrides}
          effectiveMaxBySlotId={effectiveMaxBySlotId}
          onDropPlayer={handleDrop}
          onRemoveFromSlot={removeFromSlot}
          onSlotMaxIncrease={handleSlotMaxIncrease}
          onSlotMaxDecrease={handleSlotMaxDecrease}
        />

        <div className="space-y-3">
          <PlayerTypeToggle
            value={selectedType}
            onChange={setSelectedType}
            size="sm"
          />
          <PlayerPicker
            players={filteredPlayers}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
          />
          {lastSavedAt && (
            <p className="text-[11px] text-text-muted">
              Laatst opgeslagen: {lastSavedAt.toLocaleTimeString()}
            </p>
          )}
          {loadError && (
            <p className="text-[11px] text-destructive">
              {loadError}
            </p>
          )}
        </div>
      </div>

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
