// app/internal-players/InternalPlayersTable.tsx
"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type InternalPlayer = {
  id: string;
  name: string;
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

type Props = {
  players: InternalPlayer[];
  agingThreshold: number;
  seasonYear: number;
};

export function InternalPlayersTable({
  players,
  agingThreshold,
  seasonYear,
}: Props) {
  const seasonEnd = new Date(seasonYear, 5, 30); // 30 juni van dat seizoen

  return (
    <div className="rounded-xl card-premium overflow-hidden shadow-lg">
      <div className="overflow-x-auto pb-4">
        <Table className="min-w-max">
          <TableHeader className="bg-bg-secondary">
            <TableRow className="border-border-dark hover:bg-transparent">
              <TableHead>Naam</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Beste positie</TableHead>
              <TableHead>Nevenposities</TableHead>
              <TableHead>Voorkeursbeen</TableHead>
              <TableHead>Leeftijd</TableHead>
              <TableHead>Bij club sinds</TableHead>
              <TableHead>Contract tot</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-text-muted"
                >
                  Geen interne spelers voor dit team.
                </TableCell>
              </TableRow>
            ) : (
              players.map((p) => {
                const contractExpired =
                  p.contractEndDate && p.contractEndDate < seasonEnd;
                const isAging = p.age !== null && p.age >= agingThreshold;

                return (
                  <TableRow
                    key={p.id}
                    className={cn(
                      "hover:bg-bg-hover border-border-dark transition-colors",
                      contractExpired && "opacity-70"
                    )}
                  >
                    {/* Naam + ster */}
                    <TableCell
                      className={cn(
                        "font-medium flex items-center gap-1 text-text-primary",
                        contractExpired && "text-text-muted"
                      )}
                    >
                      {p.name}
                      {p.isTopTalent && (
                        <Star
                          className="ml-1 size-4 text-accent-primary"
                          fill="var(--primary-color, #FF6A00)"
                        />
                      )}
                    </TableCell>

                    <TableCell
                      className={cn(
                        "text-text-secondary",
                        contractExpired && "text-text-muted"
                      )}
                    >
                      {p.teamLabel ?? "-"}
                    </TableCell>

                    <TableCell
                      className={cn(
                        "text-text-secondary",
                        contractExpired && "text-text-muted"
                      )}
                    >
                      {p.position ?? "-"}
                    </TableCell>

                    <TableCell
                      className={cn(
                        "text-text-secondary",
                        contractExpired && "text-text-muted"
                      )}
                    >
                      {p.secondaryPosition ?? "-"}
                    </TableCell>

                    <TableCell
                      className={cn(
                        "text-text-secondary",
                        contractExpired && "text-text-muted"
                      )}
                    >
                      {p.preferredFoot ?? "-"}
                    </TableCell>

                    {/* Leeftijd + aging-badge */}
                    <TableCell
                      className={cn(
                        "text-text-secondary",
                        contractExpired && "text-text-muted"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-accent-primary">
                          {p.age ?? "-"}
                        </span>
                        {isAging && (
                          <span className="inline-flex items-center rounded-full border border-accent-primary/40 bg-bg-secondary/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-text-muted">
                            Aging
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Bij club sinds */}
                    <TableCell
                      className={cn(
                        "text-text-secondary",
                        contractExpired && "text-text-muted"
                      )}
                    >
                      {p.joinedAt
                        ? new Date(p.joinedAt).toLocaleDateString("nl-NL")
                        : "-"}
                    </TableCell>

                    {/* Contract tot */}
                    <TableCell
                      className={cn(
                        "text-text-secondary",
                        contractExpired && "text-text-muted"
                      )}
                    >
                      {p.contractEndDate
                        ? new Date(p.contractEndDate).toLocaleDateString(
                            "nl-NL"
                          )
                        : "-"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}