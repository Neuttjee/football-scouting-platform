import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculateAgeFromDate } from "@/lib/age";
import SquadPlanningPage from "./SquadPlanningPage";

export default async function SquadPlanningServerPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [club, teams, players] = await Promise.all([
    prisma.club.findUnique({
      where: { id: session.user.clubId },
      select: { agingThreshold: true },
    }),
    prisma.team.findMany({
      where: { clubId: session.user.clubId, isActive: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, name: true, code: true, displayOrder: true },
    }),
    prisma.player.findMany({
      where: { clubId: session.user.clubId },
      include: {
        teamRef: {
          select: { id: true, name: true, code: true, displayOrder: true },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const preparedPlayers = players.map((player) => ({
    id: player.id,
    name: player.name,
    type: player.type,
    teamId: player.teamId,
    teamLabel: player.teamRef?.code || player.teamRef?.name || player.team || "-",
    teamOrder: player.teamRef?.displayOrder ?? 999,
    position: player.position,
    secondaryPosition: player.secondaryPosition,
    age: player.dateOfBirth ? calculateAgeFromDate(player.dateOfBirth) : player.age,
    status: player.status,
    contractEndDate: player.contractEndDate ? player.contractEndDate.toISOString() : null,
    isTopTalent: player.isTopTalent,
  }));

  return (
    <SquadPlanningPage
      players={preparedPlayers}
      teams={teams}
      agingThreshold={club?.agingThreshold ?? 30}
      defaultSeasonYear={new Date().getFullYear()}
    />
  );
}
