import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, getEffectiveClubId } from "@/lib/auth";
import { canEditSquadPlanning } from "@/lib/roles";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clubId = getEffectiveClubId(session);
  if (!clubId) return NextResponse.json({ error: "No club selected" }, { status: 400 });

  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");
  const seasonYearParam = searchParams.get("seasonYear");
  const formation = searchParams.get("formation");
  const scope = searchParams.get("scope"); // "user" | "club"

  if (!teamId || !seasonYearParam || !formation || !scope) {
    return NextResponse.json(
      { error: "teamId, seasonYear, formation and scope are required" },
      { status: 400 }
    );
  }

  const seasonYear = parseInt(seasonYearParam, 10);
  if (Number.isNaN(seasonYear)) {
    return NextResponse.json({ error: "seasonYear must be a number" }, { status: 400 });
  }

  const userId = session.user?.id ?? null;
  const wantClub = scope === "club";
  const wantUser = scope === "user";
  if (!wantClub && !wantUser) {
    return NextResponse.json({ error: "scope must be 'user' or 'club'" }, { status: 400 });
  }

  if (wantClub && !canEditSquadPlanning(session.user?.role) && (session.user?.role === "SCOUT" || session.user?.role === "LEZER")) {
    // read-only users can still view club snapshots; no restriction needed
  }

  if (wantUser && !userId) {
    return NextResponse.json({ error: "User id required" }, { status: 400 });
  }

  const plan = await prisma.squadPlan.findFirst({
    where: wantClub
      ? { clubId, teamId, seasonYear, formation, isClubDefault: true }
      : { clubId, teamId, seasonYear, formation, userId: userId! },
    select: { id: true, activeSnapshotId: true },
  });

  if (!plan) return NextResponse.json({ planId: null, activeSnapshotId: null, snapshots: [] });

  const snapshots = await prisma.squadPlanSnapshot.findMany({
    where: { squadPlanId: plan.id },
    orderBy: { versionNumber: "desc" },
    take: 50,
    include: {
      createdBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({
    planId: plan.id,
    activeSnapshotId: plan.activeSnapshotId,
    snapshots: snapshots.map((s) => ({
      id: s.id,
      versionNumber: s.versionNumber,
      note: s.note,
      createdAt: s.createdAt.toISOString(),
      createdBy: s.createdBy ? { id: s.createdBy.id, name: s.createdBy.name } : null,
    })),
  });
}

