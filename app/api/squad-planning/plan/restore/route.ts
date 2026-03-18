import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, getEffectiveClubId } from "@/lib/auth";
import { canEditSquadPlanning } from "@/lib/roles";

type RestorePayload = {
  snapshotId: string;
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clubId = getEffectiveClubId(session);
  if (!clubId) return NextResponse.json({ error: "No club selected" }, { status: 400 });

  if (!canEditSquadPlanning(session.user?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: RestorePayload;
  try {
    body = (await request.json()) as RestorePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { snapshotId } = body;
  if (!snapshotId || typeof snapshotId !== "string") {
    return NextResponse.json({ error: "snapshotId is required" }, { status: 400 });
  }

  const snapshot = await prisma.squadPlanSnapshot.findFirst({
    where: { id: snapshotId },
    include: { squadPlan: true },
  });

  if (!snapshot) return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
  if (snapshot.squadPlan.clubId !== clubId) {
    return NextResponse.json({ error: "Snapshot not in this club" }, { status: 403 });
  }

  const userId = session.user?.id ?? null;
  if (!snapshot.squadPlan.isClubDefault) {
    if (!userId || snapshot.squadPlan.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  await prisma.squadPlan.update({
    where: { id: snapshot.squadPlanId },
    data: {
      assignmentsJson: snapshot.assignmentsJson ?? {},
      slotMaxOverridesJson: snapshot.slotMaxOverridesJson ?? undefined,
      activeSnapshotId: snapshot.id,
    },
  });

  return NextResponse.json({ success: true });
}

