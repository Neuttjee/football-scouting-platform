"use client";

import * as React from "react";
import { createTeam, moveTeam, setTeamActive, updateAgingThreshold, updateTeamNiveau } from "./actions";
import { Button } from "@/components/ui/button";

type Team = {
  id: string;
  name: string;
  code: string | null;
  isActive: boolean;
  displayOrder: number;
  niveau?: string | null;
};

export function TeamSettingsForm({
  teams,
  agingThreshold,
}: {
  teams: Team[];
  agingThreshold: number;
}) {
  const [pending, startTransition] = React.useTransition();
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [niveau, setNiveau] = React.useState("");
  const [threshold, setThreshold] = React.useState(String(agingThreshold || 30));

  const onCreateTeam = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      await createTeam(name, code || null, niveau || null);
      setName("");
      setCode("");
      setNiveau("");
    });
  };

  const onSaveThreshold = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = parseInt(threshold, 10);
    if (Number.isNaN(parsed)) return;
    startTransition(async () => {
      await updateAgingThreshold(parsed);
    });
  };

  return (
    <div className="space-y-8">
      <form onSubmit={onSaveThreshold} className="space-y-3">
        <label className="block text-text-muted uppercase tracking-wider text-xs mb-1">
          Leeftijdsgrens (aging threshold)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={16}
            max={45}
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="w-28 border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
          />
          <Button type="submit" className="btn-premium text-white" disabled={pending}>
            Opslaan
          </Button>
        </div>
        <p className="text-xs text-text-muted">
          Spelers op of boven deze leeftijd krijgen een subtiele markering.
        </p>
      </form>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
          Teams
        </h3>

        <form onSubmit={onCreateTeam} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Teamnaam (bijv. Onder 23)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="md:col-span-2 border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
          />
          <input
            type="text"
            placeholder="Code (bijv. O23)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
          />
          <input
            type="text"
            placeholder="Niveau (bijv. Hoofdklasse)"
            value={niveau}
            onChange={(e) => setNiveau(e.target.value)}
            className="border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus:border-accent-primary focus-visible:outline-none"
          />
          <Button type="submit" className="btn-premium text-white" disabled={pending}>
            Team toevoegen
          </Button>
        </form>

        <div className="space-y-2">
          {teams.length === 0 ? (
            <p className="text-sm text-text-muted">Nog geen teams ingesteld.</p>
          ) : (
            teams.map((team, index) => (
              <div
                key={team.id}
                className="border border-border-dark rounded-lg px-3 py-2 flex items-center justify-between bg-bg-secondary/40"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-text-primary font-medium">
                    {team.code ? `${team.code} - ${team.name}` : team.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                    <span>{team.isActive ? "Actief" : "Inactief"}</span>
                    <span className="w-1 h-1 rounded-full bg-border-dark" />
                    <span>Niveau:</span>
                    <input
                      type="text"
                      defaultValue={team.niveau || ""}
                      className="border border-border-dark rounded px-2 py-1 bg-bg-primary text-text-primary text-xs focus:border-accent-primary focus-visible:outline-none"
                      onBlur={(e) =>
                        startTransition(async () => {
                          await updateTeamNiveau(team.id, e.target.value || null);
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-text-muted flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={team.isActive}
                      onChange={(e) =>
                        startTransition(async () => {
                          await setTeamActive(team.id, e.target.checked);
                        })
                      }
                    />
                    Actief
                  </label>

                  <button
                    type="button"
                    disabled={index === 0 || pending}
                    className="px-2 py-1 text-xs rounded border border-border-dark text-text-secondary disabled:opacity-40"
                    onClick={() =>
                      startTransition(async () => {
                        await moveTeam(team.id, "up");
                      })
                    }
                  >
                    Omhoog
                  </button>
                  <button
                    type="button"
                    disabled={index === teams.length - 1 || pending}
                    className="px-2 py-1 text-xs rounded border border-border-dark text-text-secondary disabled:opacity-40"
                    onClick={() =>
                      startTransition(async () => {
                        await moveTeam(team.id, "down");
                      })
                    }
                  >
                    Omlaag
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
