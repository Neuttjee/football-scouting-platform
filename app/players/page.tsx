import { getSession, getEffectiveClubId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculateAgeFromDate } from "@/lib/age";
import { redirect } from "next/navigation";
import { PlayersPageClient } from "./PlayersPageClient";

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
    niveau?: string | null;
  } | null;
  position: string | null;
  secondaryPosition: string | null;
  favoritePosition: string | null;
  preferredFoot: string | null;
  dateOfBirth: Date | null;
  age: number | null;
  step: string | null;
  status: string | null;
  currentClub: string | null;
  advies: string | null;
  niveau: string | null;
  notes: string | null;
  joinedAt: Date | null;
  contractEndDate: Date | null;
  isTopTalent: boolean;
  distanceFromClubKm: number | null;
};

type TeamOption = {
  id: string;
  name: string;
  code: string | null;
};

type InternalPlayerForPage = {
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

export default async function PlayersPage() {
  const session = await getSession();
  if (!session) return null;

  const clubId = getEffectiveClubId(session);
  if (!clubId) {
    if (session.user.role === 'SUPERADMIN') redirect('/superadmin');
    return null;
  }

  const playerInclude = {
    teamRef: {
      select: { id: true, name: true, code: true, isActive: true, displayOrder: true, niveau: true },
    },
  } as const;

  const [playersResult, clubUsers, teamsResult, clubResult] = await Promise.all([
    prisma.player.findMany({
      where: { clubId },
      orderBy: { name: "asc" },
      include: playerInclude as any,
    }),
    prisma.user.findMany({
      where: { clubId },
      select: { id: true, name: true },
    }),
    (prisma as any).team.findMany({
      where: { clubId, isActive: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, name: true, code: true, niveau: true },
    }),
    prisma.club.findUnique({
      where: { id: clubId },
    }),
  ]);

  const players = playersResult as unknown as PlayerWithRelations[];
  const teams = teamsResult as TeamOption[];
  const club = clubResult as { agingThreshold?: number | null; name?: string | null } | null;
  const agingThreshold = club?.agingThreshold ?? 30;
  const clubName = club?.name ?? session.user.clubName ?? null;

  const externalPlayers = players
    .filter((p) => p.type === "EXTERNAL")
    .map((p) => ({
      id: p.id,
      name: p.name,
      position: p.position,
      step: p.step,
      status: p.status,
      currentClub: p.currentClub,
      team: p.team,
      niveau: p.niveau,
      secondaryPosition: p.secondaryPosition,
      preferredFoot: p.preferredFoot,
      dateOfBirth: p.dateOfBirth,
      age: p.dateOfBirth ? calculateAgeFromDate(p.dateOfBirth) : p.age ?? null,
      advies: p.advies,
      notes: p.notes,
    }));

  const internalPlayers: InternalPlayerForPage[] = players
    .filter((p) => p.type === "INTERNAL")
    .map((p) => ({
      id: p.id,
      name: p.name,
      teamId: p.teamId,
      teamLabel: p.teamRef?.code || p.teamRef?.name || p.team || null,
      originTeamLabel: p.teamRef?.code || p.teamRef?.name || p.team || null,
      position: p.position,
      secondaryPosition: p.secondaryPosition,
      favoritePosition: p.favoritePosition,
      preferredFoot: p.preferredFoot,
      age: p.dateOfBirth ? calculateAgeFromDate(p.dateOfBirth) : p.age ?? null,
      joinedAt: p.joinedAt,
      contractEndDate: p.contractEndDate,
      isTopTalent: p.isTopTalent,
      distanceFromClubKm: p.distanceFromClubKm,
    }));

  return (
    <PlayersPageClient
      externalPlayers={externalPlayers}
      internalPlayers={internalPlayers}
      teams={teams}
      clubUsers={clubUsers}
      agingThreshold={agingThreshold}
      defaultSeasonYear={new Date().getFullYear()}
      clubName={clubName}
    />
  );
}