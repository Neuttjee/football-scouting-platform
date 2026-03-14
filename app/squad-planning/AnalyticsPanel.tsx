"use client";

import { FieldSlot, PlanningPlayer } from "./types";

function isContractExpired(player: PlanningPlayer, seasonYear: number) {
  if (player.type !== "INTERNAL" || !player.contractEndDate) return false;
  const seasonStart = new Date(seasonYear, 6, 1);
  return new Date(player.contractEndDate) < seasonStart;
}

function average(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function AnalyticsPanel({
  slots,
  assignments,
  playersById,
  seasonYear,
  agingThreshold,
}: {
  slots: FieldSlot[];
  assignments: Record<string, string[]>;
  playersById: Record<string, PlanningPlayer>;
  seasonYear: number;
  agingThreshold: number;
}) {
  const firstChoiceIds = slots
    .map((slot) => assignments[slot.id]?.[0])
    .filter((id): id is string => !!id);
  const secondChoiceIds = slots
    .map((slot) => assignments[slot.id]?.[1])
    .filter((id): id is string => !!id);
  const maxPerSlot = (slot: FieldSlot) => slot.maxPlayers ?? 2;
  const firstAndSecond = [...firstChoiceIds, ...secondChoiceIds]
    .map((id) => playersById[id])
    .filter(Boolean);

  const ageValues = firstAndSecond
    .map((player) => player.age)
    .filter((age): age is number => age != null);
  const avgAge = average(ageValues);

  const lineAverage = (line: FieldSlot["line"]) => {
    const ids = slots
      .filter((slot) => slot.line === line)
      .flatMap((slot) => assignments[slot.id] ?? [])
      .filter((id): id is string => !!id);
    const ages = ids
      .map((id) => playersById[id]?.age)
      .filter((age): age is number => age != null);
    return average(ages);
  };

  const tekortPosities = slots
    .filter((slot) => {
      const filled = assignments[slot.id] || [];
      const max = maxPerSlot(slot);
      return filled.length < max;
    })
    .map((slot) => slot.label);

  const uniqueAssignedIds = Array.from(
    new Set(
      slots
        .flatMap((slot) => assignments[slot.id] || [])
        .filter((id): id is string => !!id)
    )
  );

  const assignedPlayers = uniqueAssignedIds.map((id) => playersById[id]).filter(Boolean);
  const expiringContracts = assignedPlayers.filter((player) =>
    isContractExpired(player, seasonYear)
  ).length;
  const aboveThreshold = assignedPlayers.filter(
    (player) => player.age != null && player.age >= agingThreshold
  ).length;
  const externalInBasis = firstChoiceIds
    .map((id) => playersById[id])
    .filter((player) => player?.type === "EXTERNAL").length;

  const filledSlots = slots.filter((slot) => (assignments[slot.id] || []).length > 0).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <MetricCard label="Gem. leeftijd (1e+2e)" value={avgAge ? avgAge.toFixed(1) : "-"} />
      <MetricCard label="Gem. leeftijd verdediging" value={lineAverage("DEF")?.toFixed(1) ?? "-"} />
      <MetricCard label="Gem. leeftijd middenveld" value={lineAverage("MID")?.toFixed(1) ?? "-"} />
      <MetricCard label="Gem. leeftijd aanval" value={lineAverage("FWD")?.toFixed(1) ?? "-"} />
      <MetricCard
        label="Posities met tekort"
        value={tekortPosities.length}
        hint={tekortPosities.slice(0, 3).join(", ") || "Geen"}
      />
      <MetricCard label="Aflopende contracten" value={expiringContracts} />
      <MetricCard label={`Boven ${agingThreshold} jaar`} value={aboveThreshold} />
      <MetricCard label="Externe spelers in basis" value={externalInBasis} />
      <MetricCard
        label="Unieke spelers vs slots"
        value={`${uniqueAssignedIds.length} / ${filledSlots}`}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="card-premium rounded-xl p-3">
      <p className="text-[10px] uppercase tracking-wider text-text-muted">{label}</p>
      <p className="text-xl font-bold text-text-primary mt-1">{value}</p>
      {hint ? <p className="text-xs text-text-muted mt-1 truncate">{hint}</p> : null}
    </div>
  );
}
