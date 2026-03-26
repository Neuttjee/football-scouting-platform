"use client";

import * as React from "react";
import { Settings, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { Field } from "./Field";
import { FieldSkeleton } from "./FieldSkeleton";
import { PlayerPicker } from "./PlayerPicker";
import { PlayerPickerModal } from "./PlayerPickerModal";
import { FieldSlot, Formation, PlanningPlayer, TeamOption } from "./types";
import { type PlayerTypeValue } from "@/components/PlayerTypeToggle";
import { canEditSquadPlanning } from "@/lib/roles";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TeamSettingsForm } from "../settings/TeamSettingsForm";
import { useDelayedLoading } from "./useDelayedLoading";
import { useIsPortraitTablet } from "./useIsPortraitTablet";

const DEF_SLOTS: FieldSlot[] = [
  { id: "GK", label: "Keeper", x: 50, y: 92, line: "GK" },
  { id: "RB", label: "Rechtsback", x: 82, y: 60, line: "DEF" },
  { id: "RCB", label: "Rechter CV", x: 66, y: 76, line: "DEF" },
  { id: "LCB", label: "Linker CV", x: 34, y: 76, line: "DEF" },
  { id: "LB", label: "Linksback", x: 18, y: 60, line: "DEF" },
];

function getSlots(formation: Formation): FieldSlot[] {
  if (formation === "4-4-2_DIAMOND") {
    return [
      ...DEF_SLOTS,
      { id: "RM", label: "Rechtsmidden", x: 78, y: 40, line: "MID" },
      { id: "DM", label: "Controlerende 6", x: 50, y: 56, line: "MID" },
      { id: "LM", label: "Linksmidden", x: 22, y: 40, line: "MID" },
      { id: "AM", label: "10", x: 50, y: 26, line: "MID" },
      { id: "ST1", label: "Spits 1", x: 34, y: 12, line: "FWD" },
      { id: "ST2", label: "Spits 2", x: 66, y: 12, line: "FWD" },
    ];
  }
  if (formation === "4-4-2_SQUARE") {
    return [
      ...DEF_SLOTS,
      { id: "RM", label: "Rechtsmidden", x: 66, y: 29, line: "MID" },
      { id: "CMR", label: "CM rechts", x: 66, y: 44, line: "MID" },
      { id: "CML", label: "CM links", x: 34, y: 44, line: "MID" },
      { id: "LM", label: "Linksmidden", x: 34, y: 29, line: "MID" },
      { id: "ST1", label: "Spits 1", x: 34, y: 14, line: "FWD" },
      { id: "ST2", label: "Spits 2", x: 66, y: 14, line: "FWD" },
    ];
  }
  if (formation === "4-3-3_POINT_FORWARD") {
    return [
      ...DEF_SLOTS,
      { id: "DMR", label: "6 rechts", x: 68, y: 46, line: "MID" },
      { id: "DML", label: "6 links", x: 32, y: 46, line: "MID" },
      { id: "AM", label: "10", x: 50, y: 30, line: "MID" },
      { id: "RW", label: "Rechtsbuiten", x: 84, y: 16, line: "FWD" },
      { id: "ST", label: "Spits", x: 50, y: 10, line: "FWD" },
      { id: "LW", label: "Linksbuiten", x: 16, y: 16, line: "FWD" },
    ];
  }
  // 4-3-3_POINT_BACK
  return [
    ...DEF_SLOTS,
    { id: "DM", label: "Controlerende 6", x: 50, y: 50, line: "MID" },
    { id: "AMR", label: "8/10 rechts", x: 66, y: 32, line: "MID" },
    { id: "AML", label: "8/10 links", x: 34, y: 32, line: "MID" },
    { id: "RW", label: "Rechtsbuiten", x: 84, y: 16, line: "FWD" },
    { id: "ST", label: "Spits", x: 50, y: 10, line: "FWD" },
    { id: "LW", label: "Linksbuiten", x: 16, y: 16, line: "FWD" },
  ];
}

const DEFAULT_MAX_PLAYERS_PER_SLOT = 2;
const MAX_SLOT_CAP = 5;

function getEffectivePlayerType(player: PlanningPlayer, seasonYear: number): "INTERNAL" | "EXTERNAL" {
  if (player.type === "INTERNAL") return "INTERNAL";
  if (player.type !== "EXTERNAL") return "EXTERNAL";
  if (player.plannedInternalFromSeasonYear == null) return "EXTERNAL";
  return player.plannedInternalFromSeasonYear <= seasonYear ? "INTERNAL" : "EXTERNAL";
}

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
  defaultSeasonYear,
  userRole,
  userId,
}: {
  players: PlanningPlayer[];
  teams: TeamOption[];
  defaultSeasonYear: number;
  userRole: string | null;
  userId: string | null;
}) {
  const isPortraitTablet = useIsPortraitTablet();
  const initialCanEdit = React.useMemo(() => canEditSquadPlanning(userRole), [userRole]);
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
  const [pickerTargetSlotId, setPickerTargetSlotId] = React.useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [analyticsOpen, setAnalyticsOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [slotMaxOverrides, setSlotMaxOverrides] = React.useState<Record<string, number>>({});
  const [isLoadingPlan, setIsLoadingPlan] = React.useState(false);
  const [mode, setMode] = React.useState<"club" | "user">(initialCanEdit ? "club" : "club");
  const [canEdit, setCanEdit] = React.useState(initialCanEdit);
  const [clubUpdatedAt, setClubUpdatedAt] = React.useState<string | null>(null);
  const [userUpdatedAt, setUserUpdatedAt] = React.useState<string | null>(null);
  const [versionsOpen, setVersionsOpen] = React.useState(false);
  const [overwriteClubConfirmOpen, setOverwriteClubConfirmOpen] = React.useState(false);
  const [overwriteClubPushConfirmOpen, setOverwriteClubPushConfirmOpen] = React.useState(false);
  const [conflictModalOpen, setConflictModalOpen] = React.useState(false);
  const [conflictPendingAction, setConflictPendingAction] = React.useState<"saveAndSnapshot" | "pushToClub" | null>(null);
  const [planReloadNonce, setPlanReloadNonce] = React.useState(0);
  const [snapshots, setSnapshots] = React.useState<
    { id: string; versionNumber: number; note: string | null; createdAt: string; createdBy: { id: string; name: string } | null }[]
  >([]);
  const [activeSnapshotId, setActiveSnapshotId] = React.useState<string | null>(null);

  const showPlanSkeleton = useDelayedLoading(isLoadingPlan, { showDelayMs: 200, minShowMs: 300 });

  const [unsavedChangesOpen, setUnsavedChangesOpen] = React.useState(false);
  const [pendingKeyChange, setPendingKeyChange] = React.useState<{
    selectedTeamId?: string | null;
    seasonYear?: number;
    formation?: Formation;
    mode?: "club" | "user";
  } | null>(null);

  // Dirty tracking: vergelijkt de huidige UI state met de laatste DB-laad-snapshot.
  const baselineRef = React.useRef<{
    assignments: Record<string, string[]>;
    slotMaxOverrides: Record<string, number>;
  } | null>(null);

  const isDirty = React.useMemo(() => {
    if (!baselineRef.current) return false;
    const base = baselineRef.current;
    return (
      JSON.stringify(assignments) !== JSON.stringify(base.assignments) ||
      JSON.stringify(slotMaxOverrides) !== JSON.stringify(base.slotMaxOverrides)
    );
  }, [assignments, slotMaxOverrides]);

  const applyKeyChange = React.useCallback(
    (next: NonNullable<typeof pendingKeyChange>) => {
      if (next.selectedTeamId !== undefined) setSelectedTeamId(next.selectedTeamId);
      if (next.seasonYear !== undefined) setSeasonYear(next.seasonYear);
      if (next.formation !== undefined) setFormation(next.formation);
      if (next.mode !== undefined) setMode(next.mode);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const requestKeyChange = React.useCallback(
    (next: typeof pendingKeyChange) => {
      if (!next) return;
      if (!canEdit || !isDirty) {
        applyKeyChange(next);
        return;
      }
      setPendingKeyChange(next);
      setUnsavedChangesOpen(true);
    },
    [applyKeyChange, canEdit, isDirty]
  );

  const discardPendingKeyChange = React.useCallback(() => {
    if (!pendingKeyChange) {
      setUnsavedChangesOpen(false);
      return;
    }
    setUnsavedChangesOpen(false);
    applyKeyChange(pendingKeyChange);
    setPendingKeyChange(null);
  }, [applyKeyChange, pendingKeyChange]);

  const assignmentsRef = React.useRef<Record<string, string[]>>({});
  const formationRef = React.useRef<Formation>(formation);
  const slotMaxOverridesRef = React.useRef<Record<string, number>>({});

  React.useEffect(() => {
    assignmentsRef.current = assignments;
  }, [assignments]);

  React.useEffect(() => {
    slotMaxOverridesRef.current = slotMaxOverrides;
  }, [slotMaxOverrides]);

  React.useEffect(() => {
    formationRef.current = formation;
  }, [formation]);

  const saveWorkingCopy = React.useCallback(
    async (
      teamId: string,
      seasonYearToSave: number,
      formationToSave: Formation,
      assignmentsToSave: Record<string, string[]>,
      slotMaxOverridesToSave: Record<string, number>,
      options?: { force?: boolean }
    ): Promise<{ ok: true } | { ok: false; conflict?: boolean }> => {
      try {
        if (!canEdit) return { ok: false };
        setIsSaving(true);
        const endpoint =
          mode === "club" ? "/api/squad-planning/plan/club" : "/api/squad-planning/plan/draft";
        const ifUpdatedAt = options?.force
          ? null
          : mode === "club"
            ? clubUpdatedAt
            : userUpdatedAt;
        const res = await fetch(endpoint, {
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
            ifUpdatedAt,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to save squad plan", text);
          if (res.status === 409) {
            return { ok: false, conflict: true };
          }
          setLoadError("Opslaan is mislukt.");
          return { ok: false };
        }

        const data = (await res.json().catch(() => null)) as null | { updatedAt?: string | null };
        if (data?.updatedAt) {
          if (mode === "club") setClubUpdatedAt(data.updatedAt);
          else setUserUpdatedAt(data.updatedAt);
        }
        setLastSavedAt(new Date());
        return { ok: true };
      } catch (error) {
        console.error("Error saving squad plan", error);
        return { ok: false };
      } finally {
        setIsSaving(false);
      }
    },
    [canEdit, mode, clubUpdatedAt, userUpdatedAt]
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
      const effectiveType = getEffectivePlayerType(player, seasonYear);
      if (effectiveType === "EXTERNAL") {
        // Wanneer we onderliggende teams meenemen willen we externals die pas komend seizoen intern gaan
        // niet als "externe" opties tonen in deze view (dus uitvinken).
        if (
          includeFeederTeams &&
          player.plannedInternalFromSeasonYear != null &&
          player.plannedInternalFromSeasonYear === seasonYear + 1
        ) {
          return false;
        }
        return true;
      }
      if (!selectedTeamId) return true;
      if (!includeFeederTeams) return player.teamId === selectedTeamId;
      return player.teamOrder >= selectedTeamOrder;
    });
  }, [players, selectedTeamId, includeFeederTeams, selectedTeamOrder, seasonYear]);

  const assignedPlayerIds = React.useMemo(() => {
    return new Set(Object.values(assignments).flat());
  }, [assignments]);

  const pickerPlayers = React.useMemo(() => {
    return filteredPlayers
      .filter((p) => !assignedPlayerIds.has(p.id))
      .map((p) => {
        const effectiveType = getEffectivePlayerType(p, seasonYear);
        return {
          ...p,
          sourceType: p.type,
          type: effectiveType,
        };
      });
  }, [filteredPlayers, seasonYear, assignedPlayerIds]);

  // For slot rendering we need player objects for ALL ids present in `assignments`,
  // not only the ones shown in the picker list.
  const playersForField = React.useMemo(() => {
    const assignedPlayers = players.filter((p) => assignedPlayerIds.has(p.id));
    const merged = [...filteredPlayers, ...assignedPlayers];
    const dedupedById = new Map<string, PlanningPlayer>();
    for (const p of merged) {
      dedupedById.set(p.id, p);
    }
    return Array.from(dedupedById.values()).map((p) => {
      const effectiveType = getEffectivePlayerType(p, seasonYear);
      return {
        ...p,
        sourceType: p.type,
        type: effectiveType,
      };
    });
  }, [filteredPlayers, seasonYear, players, assignedPlayerIds]);

  const playersById = React.useMemo(
    () => Object.fromEntries(playersForField.map((player) => [player.id, player])),
    [playersForField]
  );

  const effectiveMaxBySlotId = React.useMemo(() => {
    const map: Record<string, number> = {};
    slots.forEach((slot) => {
      map[slot.id] = slotMaxOverrides[slot.id] ?? slot.maxPlayers ?? DEFAULT_MAX_PLAYERS_PER_SLOT;
    });
    return map;
  }, [slots, slotMaxOverrides]);

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

  const handleSlotClick = (slotId: string) => {
    if (!canEdit) return;
    setPickerTargetSlotId(slotId);
  };

  const handlePickerSelectPlayer = (playerId: string) => {
    if (!pickerTargetSlotId) return;
    handleDrop(pickerTargetSlotId, playerId);
    setPickerTargetSlotId(null);
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

  const pickerTargetSlot = React.useMemo(
    () => slots.find((slot) => slot.id === pickerTargetSlotId) ?? null,
    [slots, pickerTargetSlotId]
  );

  const getBaseMaxForSlot = (slotId: string) =>
    slots.find((s) => s.id === slotId)?.maxPlayers ?? DEFAULT_MAX_PLAYERS_PER_SLOT;

  const handleSlotMaxIncrease = (slotId: string) => {
    const base = getBaseMaxForSlot(slotId);
    setSlotMaxOverrides((prev) => {
      const current = prev[slotId] ?? base;
      if (current >= MAX_SLOT_CAP) return prev;
      const next = { ...prev, [slotId]: current + 1 };
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
      return nextOverrides;
    });
  };

  const seasonOptions = React.useMemo(
    () => Array.from({ length: 8 }, (_, idx) => defaultSeasonYear + idx),
    [defaultSeasonYear]
  );

  // NOTE: Geen auto-save. De enige persistente schrijfactie gebeurt via expliciete "Opslaan".

  // Laad bestaande opstelling bij initialisatie / wisselen team of seizoen
  React.useEffect(() => {
    const loadPlan = async () => {
      if (!selectedTeamId) return;
      try {
        setLoadError(null);
        setIsLoadingPlan(true);
        const params = new URLSearchParams({
          teamId: selectedTeamId,
          seasonYear: String(seasonYear),
          formation,
        });
        const res = await fetch(`/api/squad-planning/plan?${params.toString()}`);
        if (!res.ok) {
          console.error("Failed to load squad plan", await res.text());
          return;
        }
        const data = (await res.json()) as {
          canEdit?: boolean;
          userDraft: null | { assignments: Record<string, string[]>; slotMaxOverrides: Record<string, number>; updatedAt: string };
          clubPlan: null | { assignments: Record<string, string[]>; slotMaxOverrides: Record<string, number>; updatedAt: string };
        };

        setCanEdit(Boolean(data?.canEdit ?? initialCanEdit));
        setClubUpdatedAt(data?.clubPlan?.updatedAt ?? null);
        setUserUpdatedAt(data?.userDraft?.updatedAt ?? null);

        const planForMode = mode === "club" ? data?.clubPlan : data?.userDraft;
        if (planForMode?.assignments && typeof planForMode.assignments === "object") {
          setAssignments(planForMode.assignments);
        } else {
          setAssignments({});
        }
        if (planForMode?.slotMaxOverrides && typeof planForMode.slotMaxOverrides === "object") {
          setSlotMaxOverrides(planForMode.slotMaxOverrides);
        } else {
          setSlotMaxOverrides({});
        }

        // Reset dirty tracking op basis van wat we uit de DB hebben geladen.
        baselineRef.current = {
          assignments:
            planForMode?.assignments && typeof planForMode.assignments === "object"
              ? planForMode.assignments
              : {},
          slotMaxOverrides:
            planForMode?.slotMaxOverrides && typeof planForMode.slotMaxOverrides === "object"
              ? planForMode.slotMaxOverrides
              : {},
        };
      } catch (error) {
        console.error("Error loading squad plan", error);
        setLoadError("Opstelling kon niet geladen worden.");
      } finally {
        setIsLoadingPlan(false);
      }
    };

    loadPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeamId, seasonYear, formation, mode, initialCanEdit, planReloadNonce]);

  const refreshSnapshots = React.useCallback(async () => {
    if (!selectedTeamId) return;
    const params = new URLSearchParams({
      teamId: selectedTeamId,
      seasonYear: String(seasonYear),
      formation,
      scope: mode,
    });
    const res = await fetch(`/api/squad-planning/plan/snapshots?${params.toString()}`);
    if (!res.ok) return;
    const data = await res.json();
    setSnapshots(Array.isArray(data?.snapshots) ? data.snapshots : []);
    setActiveSnapshotId(data?.activeSnapshotId ?? null);
  }, [selectedTeamId, seasonYear, formation, mode]);

  React.useEffect(() => {
    if (!versionsOpen) return;
    void refreshSnapshots();
  }, [versionsOpen, refreshSnapshots]);

  const createSnapshot = async () => {
    if (!selectedTeamId) return;
    const res = await fetch("/api/squad-planning/plan/snapshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamId: selectedTeamId,
        seasonYear,
        formation,
        scope: mode,
        setActive: true,
      }),
    });
    if (!res.ok) return;
    await refreshSnapshots();
    setLastSavedAt(new Date());
  };

  const saveWorkingCopyThenSnapshot = React.useCallback(async (options?: { force?: boolean }) => {
    if (!selectedTeamId) return;

    // Eerst de working copy in `SquadPlan` up-to-date maken, zodat snapshot de laatste UI state bevat.
    const result = await saveWorkingCopy(
      selectedTeamId,
      seasonYear,
      formationRef.current,
      assignmentsRef.current,
      slotMaxOverridesRef.current,
      options
    );
    if (!result.ok) {
      if (result.conflict && !options?.force) {
        setConflictPendingAction("saveAndSnapshot");
        setConflictModalOpen(true);
      }
      return;
    }

    await createSnapshot();

    // Werk dirty tracking bij: na Opslaan klopt de UI nu met de DB.
    baselineRef.current = {
      assignments: assignmentsRef.current,
      slotMaxOverrides: slotMaxOverridesRef.current,
    };
    setLoadError(null);
  }, [selectedTeamId, seasonYear, saveWorkingCopy, createSnapshot]);

  const handleOpslaanClick = async () => {
    if (!canEdit) return;
    if (!selectedTeamId) return;

    // Clubplanning is één waarheid; overschrijven vraagt om expliciete bevestiging.
    if (mode === "club") {
      setOverwriteClubConfirmOpen(true);
      return;
    }

    await saveWorkingCopyThenSnapshot();
  };

  const handleConfirmOverwrite = async () => {
    setOverwriteClubConfirmOpen(false);
    await saveWorkingCopyThenSnapshot();
  };

  const pushToClub = async () => {
    if (!selectedTeamId) return;

    // Eerst jouw werk (draft) naar de DB schrijven, zodat push alles correct overneemt.
    const result = await saveWorkingCopy(
      selectedTeamId,
      seasonYear,
      formationRef.current,
      assignmentsRef.current,
      slotMaxOverridesRef.current
    );
    if (!result.ok) {
      if (result.conflict) {
        setConflictPendingAction("pushToClub");
        setConflictModalOpen(true);
      }
      return;
    }

    baselineRef.current = {
      assignments: assignmentsRef.current,
      slotMaxOverrides: slotMaxOverridesRef.current,
    };
    setLoadError(null);

    setOverwriteClubPushConfirmOpen(true);
  };

  const confirmPushToClub = async () => {
    setOverwriteClubPushConfirmOpen(false);

    const res = await fetch("/api/squad-planning/plan/push-to-club", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamId: selectedTeamId,
        seasonYear,
        formation,
        createSnapshot: true,
      }),
    });

    if (!res.ok) return;
    if (mode === "club") return;

    // Na push naar clubplanning schakelen we naar club-view.
    setMode("club");
  };

  const handleConflictOverwrite = async () => {
    setConflictModalOpen(false);
    const action = conflictPendingAction;
    setConflictPendingAction(null);

    if (!selectedTeamId) return;

    if (action === "saveAndSnapshot") {
      await saveWorkingCopyThenSnapshot({ force: true });
      return;
    }

    if (action === "pushToClub") {
      const result = await saveWorkingCopy(
        selectedTeamId,
        seasonYear,
        formationRef.current,
        assignmentsRef.current,
        slotMaxOverridesRef.current,
        { force: true }
      );

      if (!result.ok) return;

      baselineRef.current = {
        assignments: assignmentsRef.current,
        slotMaxOverrides: slotMaxOverridesRef.current,
      };
      setLoadError(null);
      setOverwriteClubPushConfirmOpen(true);
    }
  };

  const handleConflictRefresh = async () => {
    setConflictModalOpen(false);
    setConflictPendingAction(null);
    setLoadError(null);
    setPlanReloadNonce((n) => n + 1);
  };

  const restoreSnapshot = async (snapshotId: string) => {
    const res = await fetch("/api/squad-planning/plan/restore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snapshotId }),
    });
    if (!res.ok) return;
    await refreshSnapshots();
    // Reload current plan state
    const params = new URLSearchParams({
      teamId: selectedTeamId ?? "",
      seasonYear: String(seasonYear),
      formation,
    });
    const planRes = await fetch(`/api/squad-planning/plan?${params.toString()}`);
    if (planRes.ok) {
      const data = await planRes.json();
      const planForMode = mode === "club" ? data?.clubPlan : data?.userDraft;
      if (planForMode?.assignments) setAssignments(planForMode.assignments);
      if (planForMode?.slotMaxOverrides) setSlotMaxOverrides(planForMode.slotMaxOverrides);
    }
  };

  return (
    <div className="space-y-3 md:space-y-4">
      <div
        className={cn(
          "grid grid-cols-1 gap-6 items-start",
          !isPortraitTablet && "xl:grid-cols-[minmax(0,1.6fr)_390px]"
        )}
      >
        <div
          className={cn(
            "flex gap-4",
            isPortraitTablet ? "flex-col items-stretch" : "flex-col md:flex-row items-start"
          )}
        >
          {/* Linkerkolom: teamselectie + filters onder elkaar */}
          <div
            className={cn(
              "w-full space-y-3",
              !isPortraitTablet && "md:w-60 max-w-xs",
              isPortraitTablet &&
                "rounded-xl border border-border-dark bg-bg-card/70 backdrop-blur-sm p-3 shadow-sm"
            )}
          >
            <div
              className={cn(
                isPortraitTablet
                  ? "flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1"
                  : "space-y-3"
              )}
            >
              <div
                className={cn(
                  "inline-flex items-center gap-1 rounded-md bg-bg-secondary/80 border border-border-dark shadow-sm p-0.5",
                  isPortraitTablet ? "min-w-[320px]" : "w-full"
                )}
              >
                <button
                  type="button"
                  disabled={!canEdit}
                  onClick={() => requestKeyChange({ mode: "club" })}
                  className={cn(
                    "flex-1 px-3 py-1 text-xs font-medium rounded-md transition-colors",
                    mode === "club"
                      ? "bg-accent-primary text-primary-foreground"
                      : "text-text-muted hover:text-text-primary hover:bg-bg-primary/70",
                    !canEdit && "opacity-60 cursor-not-allowed"
                  )}
                >
                  Clubplanning
                </button>
                <button
                  type="button"
                  disabled={!canEdit || !userId}
                  onClick={() => requestKeyChange({ mode: "user" })}
                  className={cn(
                    "flex-1 px-3 py-1 text-xs font-medium rounded-md transition-colors",
                    mode === "user"
                      ? "bg-accent-primary text-primary-foreground"
                      : "text-text-muted hover:text-text-primary hover:bg-bg-primary/70",
                    (!canEdit || !userId) && "opacity-60 cursor-not-allowed"
                  )}
                >
                  Mijn draft
                </button>
              </div>

              <div
                className={cn(
                  "space-y-2",
                  isPortraitTablet && "flex items-center gap-2 flex-nowrap whitespace-nowrap space-y-0"
                )}
              >
              {canEdit && (
                <>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => void handleOpslaanClick()}
                    className={cn(
                      "inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-md border border-border-dark text-xs",
                      isPortraitTablet ? "w-auto" : "w-full",
                      isSaving
                        ? "text-text-muted cursor-not-allowed"
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-primary/60"
                    )}
                    title="Sla een versie-snapshot op"
                  >
                    Opslaan
                  </button>
                  <Dialog open={overwriteClubConfirmOpen} onOpenChange={setOverwriteClubConfirmOpen}>
                    <DialogContent
                      className="max-w-md bg-bg-card border-accent-primary text-text-primary"
                    >
                      <DialogHeader>
                        <DialogTitle>Overschrijven?</DialogTitle>
                      </DialogHeader>
                      <p className="text-sm text-text-muted">
                        Weet je zeker dat je de clubplanning voor dit seizoen wilt overschrijven?
                      </p>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded border border-border-dark text-text-secondary hover:text-text-primary hover:bg-bg-primary/60"
                          onClick={() => setOverwriteClubConfirmOpen(false)}
                          disabled={isSaving}
                        >
                          Annuleren
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded bg-accent-primary text-primary-foreground text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                          onClick={() => void handleConfirmOverwrite()}
                          disabled={isSaving}
                        >
                          Overschrijven
                        </button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {mode === "user" && (
                    <button
                      type="button"
                      onClick={() => void pushToClub()}
                      disabled={!userId}
                      className={cn(
                        "inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-md bg-accent-primary text-primary-foreground text-xs disabled:opacity-60 disabled:cursor-not-allowed",
                        isPortraitTablet ? "w-auto" : "w-full"
                      )}
                      title="Zet jouw draft door naar clubplanning"
                    >
                      Push naar club
                    </button>
                  )}
                  <Dialog
                    open={overwriteClubPushConfirmOpen}
                    onOpenChange={setOverwriteClubPushConfirmOpen}
                  >
                    <DialogContent className="max-w-md bg-bg-card border-accent-primary text-text-primary">
                      <DialogHeader>
                        <DialogTitle>Overschrijven?</DialogTitle>
                      </DialogHeader>
                      <p className="text-sm text-text-muted">
                        Weet je zeker dat je de clubplanning voor dit seizoen wilt overschrijven met jouw draft?
                      </p>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded border border-border-dark text-text-secondary hover:text-text-primary hover:bg-bg-primary/60"
                          onClick={() => setOverwriteClubPushConfirmOpen(false)}
                          disabled={isSaving}
                        >
                          Annuleren
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded bg-accent-primary text-primary-foreground text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                          onClick={() => void confirmPushToClub()}
                          disabled={isSaving}
                        >
                          Overschrijven
                        </button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog
                    open={unsavedChangesOpen}
                    onOpenChange={(open) => {
                      setUnsavedChangesOpen(open);
                      if (!open) setPendingKeyChange(null);
                    }}
                  >
                    <DialogContent className="max-w-md bg-bg-card border-accent-primary text-text-primary">
                      <DialogHeader>
                        <DialogTitle>Niet opgeslagen wijzigingen</DialogTitle>
                      </DialogHeader>
                      <p className="text-sm text-text-muted">
                        Je hebt wijzigingen gemaakt. Weet je zeker dat je deze wilt weggooien?
                      </p>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded border border-border-dark text-text-secondary hover:text-text-primary hover:bg-bg-primary/60"
                          onClick={() => {
                            setUnsavedChangesOpen(false);
                            setPendingKeyChange(null);
                          }}
                        >
                          Annuleren
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded bg-destructive text-destructive-foreground text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                          onClick={() => void discardPendingKeyChange()}
                        >
                          Wijzigingen weggooien
                        </button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog
                    open={conflictModalOpen}
                    onOpenChange={(open) => {
                      setConflictModalOpen(open);
                      if (!open) setConflictPendingAction(null);
                    }}
                  >
                    <DialogContent className="max-w-md bg-bg-card border-accent-primary text-text-primary">
                      <DialogHeader>
                        <DialogTitle>Wijziging conflict</DialogTitle>
                      </DialogHeader>
                      <p className="text-sm text-text-muted">
                        Iemand anders heeft de planning aangepast. Wil je jouw wijzigingen overschrijven of de nieuwste versie laden?
                      </p>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded border border-border-dark text-text-secondary hover:text-text-primary hover:bg-bg-primary/60"
                          onClick={() => void handleConflictRefresh()}
                          disabled={isSaving}
                        >
                          Nieuwste versie laden
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded bg-accent-primary text-primary-foreground text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                          onClick={() => void handleConflictOverwrite()}
                          disabled={isSaving || !conflictPendingAction}
                        >
                          Overschrijven
                        </button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={versionsOpen} onOpenChange={setVersionsOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-md border border-border-dark text-xs text-text-secondary hover:text-text-primary hover:bg-bg-primary/60",
                          isPortraitTablet ? "w-auto" : "w-full"
                        )}
                      >
                        Versies
                      </button>
                    </DialogTrigger>
                    <DialogContent
                      size="wide"
                      className="max-h-[90vh] overflow-y-auto bg-bg-card border-accent-primary text-text-primary"
                    >
                      <DialogHeader>
                        <DialogTitle>
                          Versies ({mode === "club" ? "clubplanning" : "mijn draft"})
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2">
                        {snapshots.length === 0 ? (
                          <p className="text-sm text-text-muted">
                            Nog geen versies opgeslagen.
                          </p>
                        ) : (
                          snapshots.map((s) => (
                            <div
                              key={s.id}
                              className="flex items-center justify-between gap-3 border border-border-dark rounded-md p-3 bg-bg-secondary/30"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-text-primary truncate">
                                  v{s.versionNumber}
                                  {s.id === activeSnapshotId ? " (actief)" : ""}
                                </p>
                                <p className="text-xs text-text-muted truncate">
                                  {new Date(s.createdAt).toLocaleString()} •{" "}
                                  {s.createdBy?.name ?? "Onbekend"}
                                  {s.note ? ` • ${s.note}` : ""}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => void restoreSnapshot(s.id)}
                                className="px-3 py-1.5 rounded border border-border-dark text-xs text-text-secondary hover:text-text-primary hover:bg-bg-primary/60"
                              >
                                Terugzetten
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              </div>
            </div>

            <div className={cn(isPortraitTablet && "flex items-center gap-3 overflow-x-auto whitespace-nowrap pb-1")}>
              <div
                className={cn(
                  "inline-flex flex-wrap items-center gap-1 rounded-md bg-bg-secondary/80 border border-border-dark shadow-sm p-0.5",
                  isPortraitTablet && "flex-nowrap"
                )}
              >
                {teams.map((team) => {
                  const active = team.id === selectedTeamId;
                  return (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => requestKeyChange({ selectedTeamId: team.id })}
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

              <div
                className={cn("flex gap-2", isPortraitTablet ? "items-center flex-row" : "flex-col")}
              >
                <label className="text-[11px] uppercase tracking-wide text-text-muted">
                  Seizoen
                </label>
                <select
                  value={seasonYear}
                  onChange={(e) => requestKeyChange({ seasonYear: parseInt(e.target.value, 10) })}
                  className="border border-border-dark rounded px-2 py-1.5 text-xs bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
                >
                  {seasonOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}-{year + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className={cn("flex gap-2", isPortraitTablet ? "items-center flex-row" : "flex-col")}
              >
                <label className="text-[11px] uppercase tracking-wide text-text-muted">
                  Opstelling
                </label>
                <select
                  value={formation}
                  onChange={(e) => requestKeyChange({ formation: e.target.value as Formation })}
                  className="border border-border-dark rounded px-2 py-1.5 text-xs bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
                >
                  <option value="4-3-3_POINT_BACK">4-3-3 p.n.a.</option>
                  <option value="4-3-3_POINT_FORWARD">4-3-3 p.n.v.</option>
                  <option value="4-4-2_DIAMOND">4-4-2 ruit</option>
                  <option value="4-4-2_SQUARE">4-4-2 vierkant</option>
                </select>
              </div>

              <label className="text-xs text-text-muted flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeFeederTeams}
                  onChange={(e) => setIncludeFeederTeams(e.target.checked)}
                />
                Onderliggende teams meenemen
              </label>
            </div>

            {isPortraitTablet && (
              <div className="flex items-center gap-2 justify-end">
                <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border-dark text-xs text-text-secondary hover:text-text-primary hover:bg-bg-primary/60"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Analyse</span>
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
                      <span>Instellingen</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent
                    size="wide"
                    className="max-h-[90vh] overflow-y-auto bg-bg-card border-accent-primary text-text-primary"
                  >
                    <DialogHeader>
                      <DialogTitle>Instellingen</DialogTitle>
                    </DialogHeader>
                    <TeamSettingsForm teams={teams} />
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {lastSavedAt && (
              <p className="text-[11px] text-text-muted">
                Laatst opgeslagen: {lastSavedAt.toLocaleTimeString()}
              </p>
            )}
            {loadError && (
              <p className="text-[11px] text-destructive">{loadError}</p>
            )}
          </div>

        {/* Veld */}
        <div className={cn("min-w-0", isPortraitTablet ? "w-full flex justify-center" : "flex-1")}>
          {showPlanSkeleton ? (
            <FieldSkeleton slots={slots} />
          ) : (
            <Field
              slots={slots}
              assignments={assignments}
              playersById={playersById}
              seasonYear={seasonYear}
              selectedTeamOrder={selectedTeamOrder}
              slotMaxOverrides={slotMaxOverrides}
              effectiveMaxBySlotId={effectiveMaxBySlotId}
              canEdit={canEdit}
              onDropPlayer={handleDrop}
              onSlotClick={handleSlotClick}
              onRemoveFromSlot={removeFromSlot}
              onSlotMaxIncrease={handleSlotMaxIncrease}
              onSlotMaxDecrease={handleSlotMaxDecrease}
            />
          )}
        </div>
        </div>

        {!isPortraitTablet && (
        <div className="space-y-8">
          <div className="flex justify-end gap-2 flex-wrap">
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
                <TeamSettingsForm teams={teams} />
              </DialogContent>
            </Dialog>
          </div>
          <PlayerPicker
            players={pickerPlayers}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            seasonYear={seasonYear}
          />
        </div>
        )}
      </div>

      <PlayerPickerModal
        open={pickerTargetSlotId != null}
        onOpenChange={(open) => {
          if (!open) setPickerTargetSlotId(null);
        }}
        slot={pickerTargetSlot}
        players={pickerPlayers}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        seasonYear={seasonYear}
        onSelectPlayer={handlePickerSelectPlayer}
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
