import { redirect } from "next/navigation";
import { getSession, getEffectiveClubId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculateAgeFromDate } from "@/lib/age";
import SquadPlanningPage from "./SquadPlanningPage";

export default async function SquadPlanningServerPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const clubId = getEffectiveClubId(session);
  if (!clubId) redirect("/superadmin");

  const [club, teams, players] = await Promise.all([
    (prisma as any).club.findUnique({
      where: { id: clubId },
      select: { agingThreshold: true },
    }),
    (prisma as any).team.findMany({
      where: { clubId },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        code: true,
        niveau: true,
        displayOrder: true,
        isActive: true,
      },
    }),
    prisma.player.findMany({
      where: { clubId },
      include: {
        teamRef: {
          select: { id: true, name: true, code: true, displayOrder: true },
        },
      } as any,
      orderBy: { name: "asc" },
    }),
  ]);

  const clubWithAging = club as { agingThreshold?: number | null } | null;
  const playersWithExtras = players as any[];

  const preparedPlayers = playersWithExtras.map((player) => ({
    id: player.id,
    name: player.name,
    type: player.type,
    teamId: player.teamId,
    teamLabel:
      player.teamRef?.code || player.teamRef?.name || player.team || "-",
    teamOrder: player.teamRef?.displayOrder ?? 999,
    position: player.position,
    secondaryPosition: player.secondaryPosition,
    age: player.dateOfBirth
      ? calculateAgeFromDate(player.dateOfBirth)
      : player.age,
    status: player.status,
    contractEndDate: player.contractEndDate
      ? player.contractEndDate.toISOString()
      : null,
    isTopTalent: player.isTopTalent,
  }));

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentSeasonStartYear = currentMonth >= 6 ? currentYear : currentYear - 1;

  return (
    <SquadPlanningPage
      players={preparedPlayers}
      teams={teams}
      agingThreshold={clubWithAging?.agingThreshold ?? 30}
      defaultSeasonYear={currentSeasonStartYear}
    />
  );
}