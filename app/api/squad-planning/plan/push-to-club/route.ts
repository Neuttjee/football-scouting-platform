import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, getEffectiveClubId } from "@/lib/auth";
import { canEditSquadPlanning } from "@/lib/roles";

type PushPayload = {
  teamId: string;
  seasonYear: number;
  formation: string;
  note?: string | null;
  createSnapshot?: boolean | null;
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clubId = getEffectiveClubId(session);
  if (!clubId) return NextResponse.json({ error: "No club selected" }, { status: 400 });

  if (!canEditSquadPlanning(session.user?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userId = session.user?.id ?? null;
  if (!userId) return NextResponse.json({ error: "User id required" }, { status: 400 });

  let body: PushPayload;
  try {
    body = (await request.json()) as PushPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { teamId, seasonYear, formation, note, createSnapshot } = body;
  if (!teamId || typeof teamId !== "string") {
    return NextResponse.json({ error: "teamId is required" }, { status: 400 });
  }
  if (!Number.isInteger(seasonYear)) {
    return NextResponse.json({ error: "seasonYear must be an integer" }, { status: 400 });
  }
  if (!formation || typeof formation !== "string") {
    return NextResponse.json({ error: "formation is required" }, { status: 400 });
  }

  const team = await prisma.team.findFirst({
    where: { id: teamId, clubId },
    select: { id: true },
  });
  if (!team) {
    return NextResponse.json({ error: "Team does not belong to this club" }, { status: 400 });
  }

  const userDraft = await prisma.squadPlan.findFirst({
    where: { clubId, teamId, seasonYear, formation, userId },
  });
  if (!userDraft) {
    return NextResponse.json({ error: "User draft not found" }, { status: 404 });
  }

  const existingClub = await prisma.squadPlan.findFirst({
    where: { clubId, teamId, seasonYear, formation, isClubDefault: true },
    select: { id: true },
  });

  const clubPlan = existingClub
    ? await prisma.squadPlan.update({
        where: { id: existingClub.id },
        data: {
          clubId,
          teamId,
          seasonYear,
          userId: null,
          formation,
          assignmentsJson: userDraft.assignmentsJson ?? {},
          slotMaxOverridesJson: userDraft.slotMaxOverridesJson ?? undefined,
          isClubDefault: true,
        },
      })
    : await prisma.squadPlan.create({
        data: {
          clubId,
          teamId,
          seasonYear,
          userId: null,
          formation,
          assignmentsJson: userDraft.assignmentsJson ?? {},
          slotMaxOverridesJson: userDraft.slotMaxOverridesJson ?? undefined,
          isClubDefault: true,
        },
      });

  const shouldSnapshot = createSnapshot !== false;
  if (shouldSnapshot) {
    const agg = await prisma.squadPlanSnapshot.aggregate({
      where: { squadPlanId: clubPlan.id },
      _max: { versionNumber: true },
    });
    const nextVersion = (agg._max.versionNumber ?? 0) + 1;
    const snapshot = await prisma.squadPlanSnapshot.create({
      data: {
        squadPlanId: clubPlan.id,
        versionNumber: nextVersion,
        note: note ?? "Push vanuit persoonlijke draft",
        createdById: userId,
        assignmentsJson: clubPlan.assignmentsJson ?? {},
        slotMaxOverridesJson: clubPlan.slotMaxOverridesJson ?? undefined,
      },
      select: { id: true },
    });
    await prisma.squadPlan.update({
      where: { id: clubPlan.id },
      data: { activeSnapshotId: snapshot.id },
    });
  }

  return NextResponse.json({ success: true });
}

