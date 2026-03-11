import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, getEffectiveClubId } from "@/lib/auth";

type SquadPlanPayload = {
  teamId: string;
  seasonYear: number;
  formation: string;
  assignments: Record<string, string[]>;
  isClubDefault?: boolean;
};

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clubId = getEffectiveClubId(session);
  if (!clubId) {
    return NextResponse.json({ error: "No club selected" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");
  const seasonYearParam = searchParams.get("seasonYear");

  if (!teamId || !seasonYearParam) {
    return NextResponse.json(
      { error: "teamId and seasonYear are required" },
      { status: 400 }
    );
  }

  const seasonYear = parseInt(seasonYearParam, 10);
  if (Number.isNaN(seasonYear)) {
    return NextResponse.json(
      { error: "seasonYear must be a number" },
      { status: 400 }
    );
  }

  const userId = session.user?.id ?? null;

  // Eerst proberen: persoonlijke opstelling
  const personalPlan = userId
    ? await prisma.squadPlan.findFirst({
        where: {
          clubId,
          teamId,
          seasonYear,
          userId,
        },
      })
    : null;

  // Fallback: club-default
  const clubDefaultPlan = await prisma.squadPlan.findFirst({
    where: {
      clubId,
      teamId,
      seasonYear,
      isClubDefault: true,
    },
  });

  const plan = personalPlan ?? clubDefaultPlan;

  if (!plan) {
    return NextResponse.json({ plan: null });
  }

  return NextResponse.json({
    plan: {
      formation: plan.formation,
      assignments: plan.assignmentsJson ?? {},
      isClubDefault: plan.isClubDefault,
    },
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clubId = getEffectiveClubId(session);
  if (!clubId) {
    return NextResponse.json({ error: "No club selected" }, { status: 400 });
  }

  const userId = session.user?.id ?? null;

  let body: SquadPlanPayload;
  try {
    body = (await request.json()) as SquadPlanPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { teamId, seasonYear, formation, assignments, isClubDefault } = body;

  if (!teamId || typeof teamId !== "string") {
    return NextResponse.json({ error: "teamId is required" }, { status: 400 });
  }

  if (!Number.isInteger(seasonYear)) {
    return NextResponse.json(
      { error: "seasonYear must be an integer" },
      { status: 400 }
    );
  }

  if (!formation || typeof formation !== "string") {
    return NextResponse.json(
      { error: "formation is required" },
      { status: 400 }
    );
  }

  if (!assignments || typeof assignments !== "object") {
    return NextResponse.json(
      { error: "assignments must be an object" },
      { status: 400 }
    );
  }

  // Verifiëer dat het team bij de club hoort
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      clubId,
    },
    select: { id: true },
  });

  if (!team) {
    return NextResponse.json(
      { error: "Team does not belong to this club" },
      { status: 400 }
    );
  }

  const saveAsClubDefault = Boolean(isClubDefault);

  if (!saveAsClubDefault && !userId) {
    return NextResponse.json(
      { error: "User id required for personal plans" },
      { status: 400 }
    );
  }

  const whereClause = saveAsClubDefault
    ? {
        clubId,
        teamId,
        seasonYear,
        isClubDefault: true,
      }
    : {
        clubId,
        teamId,
        seasonYear,
        userId: userId!,
      };

  const existing = await prisma.squadPlan.findFirst({
    where: whereClause,
    select: { id: true },
  });

  const data = {
    clubId,
    teamId,
    seasonYear,
    userId: saveAsClubDefault ? null : userId,
    formation,
    assignmentsJson: assignments,
    isClubDefault: saveAsClubDefault,
  };

  if (existing) {
    await prisma.squadPlan.update({
      where: { id: existing.id },
      data,
    });
  } else {
    await prisma.squadPlan.create({
      data,
    });
  }

  return NextResponse.json({ success: true });
}

