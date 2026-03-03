// app/internal-players/page.tsx
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculateAgeFromDate } from "@/lib/age";
import InternalPlayersPage from "./InternalPlayersPage";
import { redirect } from "next/navigation";

type PlayerWithRelations = {
  id: string;
  name: string;
  type: "INTERNAL" | "EXTERNAL";
  teamId: string | null;
  team: string | null;
  teamRef: {
    id: string;
    name: string | null;
    code: string | null;
    isActive: boolean;
    displayOrder: number;
  } | null;
  position: string | null;
  secondaryPosition: string | null;
  preferredFoot: string | null;
  dateOfBirth: Date | null;
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

type ClubWithThreshold = {
  agingThreshold?: number | null;
};

type InternalPlayerForPage = {
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

export default async function InternalPlayersServerPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const playerInclude = {
    teamRef: {
      select: { id: true, name: true, code: true, isActive: true, displayOrder: true },
    },
  } as const;

  const playersResult = await prisma.player.findMany({
    where: {
      clubId: session.user.clubId,
    },
    // Cast include to any to work around potential Prisma type lag
    include: playerInclude as any,
    orderBy: { name: "asc" },
  });

  const players = playersResult as unknown as PlayerWithRelations[];

  const teamsResult = await (prisma as any).team.findMany({
    where: { clubId: session.user.clubId, isActive: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, code: true },
  });

  const teams = teamsResult as TeamOption[];

  const clubResult = await prisma.club.findUnique({
    where: { id: session.user.clubId },
  });

  const club = clubResult as ClubWithThreshold | null;

  const internalPlayers = players.filter(
    (p: PlayerWithRelations) => p.type === "INTERNAL"
  );

  const playersWithAge: InternalPlayerForPage[] = internalPlayers.map((p) => ({
    id: p.id,
    name: p.name,
    teamId: p.teamId,
    teamLabel: p.teamRef?.code || p.teamRef?.name || p.team || null,
    originTeamLabel: p.teamRef?.code || p.teamRef?.name || p.team || null,
    position: p.position,
    secondaryPosition: p.secondaryPosition,
    preferredFoot: p.preferredFoot,
    age: p.dateOfBirth ? calculateAgeFromDate(p.dateOfBirth) : p.age ?? null,
    joinedAt: p.joinedAt,
    contractEndDate: p.contractEndDate,
    isTopTalent: p.isTopTalent,
  }));

  return (
    <InternalPlayersPage
      players={playersWithAge}
      teams={teams}
      agingThreshold={club?.agingThreshold ?? 30}
      defaultSeasonYear={new Date().getFullYear()}
    />
  );
}