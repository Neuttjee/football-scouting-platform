import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, getEffectiveClubId } from "@/lib/auth";
import { canEditSquadPlanning } from "@/lib/roles";

type SnapshotPayload = {
  teamId: string;
  seasonYear: number;
  formation: string;
  scope: "user" | "club";
  note?: string | null;
  setActive?: boolean | null;
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

  let body: SnapshotPayload;
  try {
    body = (await request.json()) as SnapshotPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { teamId, seasonYear, formation, scope, note, setActive } = body;

  if (!teamId || typeof teamId !== "string") {
    return NextResponse.json({ error: "teamId is required" }, { status: 400 });
  }
  if (!Number.isInteger(seasonYear)) {
    return NextResponse.json({ error: "seasonYear must be an integer" }, { status: 400 });
  }
  if (!formation || typeof formation !== "string") {
    return NextResponse.json({ error: "formation is required" }, { status: 400 });
  }
  if (scope !== "club" && scope !== "user") {
    return NextResponse.json({ error: "scope must be 'user' or 'club'" }, { status: 400 });
  }
  if (scope === "user" && !userId) {
    return NextResponse.json({ error: "User id required" }, { status: 400 });
  }

  const plan = await prisma.squadPlan.findFirst({
    where:
      scope === "club"
        ? { clubId, teamId, seasonYear, formation, isClubDefault: true }
        : { clubId, teamId, seasonYear, formation, userId: userId! },
  });

  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const agg = await prisma.squadPlanSnapshot.aggregate({
    where: { squadPlanId: plan.id },
    _max: { versionNumber: true },
  });
  const nextVersion = (agg._max.versionNumber ?? 0) + 1;

  const snapshot = await prisma.squadPlanSnapshot.create({
    data: {
      squadPlanId: plan.id,
      versionNumber: nextVersion,
      note: note ?? null,
      createdById: userId,
      assignmentsJson: plan.assignmentsJson ?? {},
      slotMaxOverridesJson: plan.slotMaxOverridesJson ?? undefined,
    },
    select: { id: true, versionNumber: true, createdAt: true },
  });

  const shouldActivate = Boolean(setActive);
  if (shouldActivate) {
    await prisma.squadPlan.update({
      where: { id: plan.id },
      data: { activeSnapshotId: snapshot.id },
    });
  }

  return NextResponse.json({
    success: true,
    snapshot: {
      id: snapshot.id,
      versionNumber: snapshot.versionNumber,
      createdAt: snapshot.createdAt.toISOString(),
    },
    activeSnapshotId: shouldActivate ? snapshot.id : plan.activeSnapshotId ?? null,
  });
}

