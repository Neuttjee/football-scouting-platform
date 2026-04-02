"use client";

import * as React from "react";
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

type LineKey = FieldSlot["line"];

const LINES: Array<{ key: LineKey; label: string }> = [
  { key: "GK", label: "Keeper" },
  { key: "DEF", label: "Verdediging" },
  { key: "MID", label: "Middenveld" },
  { key: "FWD", label: "Aanval" },
];

function normalizePreferredFoot(value: string | null | undefined) {
  const normalized = (value ?? "").trim().toLowerCase();
  if (!normalized) return "Onbekend";
  if (normalized.includes("link")) return "Links";
  if (normalized.includes("right") || normalized.includes("recht")) return "Rechts";
  if (normalized.includes("beid") || normalized.includes("both")) return "Beide";
  return "Onbekend";
}

function getSlotPlayerIds(slot: FieldSlot, assignments: Record<string, string[]>) {
  return (assignments[slot.id] ?? []).filter(Boolean);
}

function getExpectedPerSlot(slot: FieldSlot, effectiveMaxBySlotId: Record<string, number>) {
  const max = effectiveMaxBySlotId[slot.id] ?? slot.maxPlayers ?? 2;
  return max;
}

function buildLineMetrics({
  line,
  slots,
  assignments,
  playersById,
  seasonYear,
  effectiveMaxBySlotId,
}: {
  line: LineKey;
  slots: FieldSlot[];
  assignments: Record<string, string[]>;
  playersById: Record<string, PlanningPlayer>;
  seasonYear: number;
  effectiveMaxBySlotId: Record<string, number>;
}) {
  const lineSlots = slots.filter((slot) => slot.line === line);
  const slotEntries = lineSlots.flatMap((slot) => getSlotPlayerIds(slot, assignments));
  const uniqueIds = Array.from(new Set(slotEntries));
  const players = uniqueIds.map((id) => playersById[id]).filter(Boolean);
  const ageValues = players.map((player) => player.age).filter((age): age is number => age != null);
  const requiredCapacity = lineSlots.reduce(
    (sum, slot) => sum + getExpectedPerSlot(slot, effectiveMaxBySlotId),
    0
  );
  const filledCapacity = lineSlots.reduce(
    (sum, slot) => sum + getSlotPlayerIds(slot, assignments).length,
    0
  );
  const tekort = Math.max(0, requiredCapacity - filledCapacity);
  const tekortPosities = lineSlots
    .filter((slot) => {
      const filled = getSlotPlayerIds(slot, assignments).length;
      const expected = getExpectedPerSlot(slot, effectiveMaxBySlotId);
      return filled < expected;
    })
    .map((slot) => slot.label);

  const preferredFootCounts = players.reduce<Record<string, number>>((acc, player) => {
    const key = normalizePreferredFoot(player.preferredFoot);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return {
    line,
    uniqueIds,
    uniqueCount: uniqueIds.length,
    totalAssignedCount: slotEntries.length,
    avgAge: average(ageValues),
    u23Count: ageValues.filter((age) => age <= 22).length,
    over30Count: ageValues.filter((age) => age >= 30).length,
    expiringContracts: players.filter((player) => isContractExpired(player, seasonYear)).length,
    tekort,
    tekortPosities,
    preferredFootCounts,
  };
}

export function AnalyticsPanel({
  slots,
  assignments,
  playersById,
  seasonYear,
  effectiveMaxBySlotId,
}: {
  slots: FieldSlot[];
  assignments: Record<string, string[]>;
  playersById: Record<string, PlanningPlayer>;
  seasonYear: number;
  effectiveMaxBySlotId: Record<string, number>;
}) {
  const lineMetrics = React.useMemo(
    () =>
      LINES.map((line) =>
        buildLineMetrics({
          line: line.key,
          slots,
          assignments,
          playersById,
          seasonYear,
          effectiveMaxBySlotId,
        })
      ),
    [slots, assignments, playersById, seasonYear, effectiveMaxBySlotId]
  );

  const uniqueAssignedIds = React.useMemo(
    () => Array.from(new Set(lineMetrics.flatMap((line) => line.uniqueIds))),
    [lineMetrics]
  );
  const allPlayers = React.useMemo(
    () => uniqueAssignedIds.map((id) => playersById[id]).filter(Boolean),
    [uniqueAssignedIds, playersById]
  );
  const allAges = allPlayers.map((player) => player.age).filter((age): age is number => age != null);
  const avgAge = average(allAges);
  const u23Count = allAges.filter((age) => age <= 22).length;
  const over30Count = allAges.filter((age) => age >= 30).length;
  const expiringContracts = allPlayers.filter((player) => isContractExpired(player, seasonYear)).length;
  const totalTekort = lineMetrics.reduce((sum, line) => sum + line.tekort, 0);
  const tekortPosities = lineMetrics.flatMap((line) => line.tekortPosities);

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-muted">
        Analyse seizoen {seasonYear}-{seasonYear + 1} op basis van alle ingevulde spelers in de opstelling
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricCard label="Unieke spelers" value={uniqueAssignedIds.length} />
        <MetricCard label="Gem. leeftijd" value={avgAge != null ? avgAge.toFixed(1) : "-"} />
        <MetricCard label="Aflopende contracten" value={expiringContracts} />
        <MetricCard label="U23 (<=22)" value={u23Count} />
        <MetricCard label="30+ (>=30)" value={over30Count} />
        <MetricCard
          label="Posities met tekort"
          value={totalTekort}
          hint={tekortPosities.slice(0, 3).join(", ") || "Geen"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {lineMetrics.map((line) => {
          const lineLabel = LINES.find((item) => item.key === line.line)?.label ?? line.line;
          const footHint = ["Links", "Rechts", "Beide", "Onbekend"]
            .map((label) => `${label}: ${line.preferredFootCounts[label] ?? 0}`)
            .join(" | ");
          return (
            <div key={line.line} className="card-premium rounded-xl p-3 space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-text-muted">{lineLabel}</p>
              <div className="grid grid-cols-2 gap-2">
                <MetricCard label="Gem. leeftijd" value={line.avgAge != null ? line.avgAge.toFixed(1) : "-"} compact />
                <MetricCard label="Spelers" value={`${line.uniqueCount} / ${line.totalAssignedCount}`} compact />
                <MetricCard label="U23" value={line.u23Count} compact />
                <MetricCard label="30+" value={line.over30Count} compact />
                <MetricCard label="Aflopend" value={line.expiringContracts} compact />
                <MetricCard label="Tekort" value={line.tekort} hint={line.tekortPosities.slice(0, 2).join(", ") || "Geen"} compact />
              </div>
              <p className="text-xs text-text-muted">Voorkeursbeen: {footHint}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  compact = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  compact?: boolean;
}) {
  return (
    <div className={`card-premium rounded-xl ${compact ? "p-2" : "p-3"}`}>
      <p className="text-[10px] uppercase tracking-wider text-text-muted">{label}</p>
      <p className={`${compact ? "text-base" : "text-xl"} font-bold text-text-primary mt-1`}>{value}</p>
      {hint ? <p className="text-xs text-text-muted mt-1 truncate">{hint}</p> : null}
    </div>
  );
}
