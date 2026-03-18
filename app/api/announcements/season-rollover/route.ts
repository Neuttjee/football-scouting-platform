import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, getEffectiveClubId } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ show: false });

  const clubId = getEffectiveClubId(session);
  if (!clubId) return NextResponse.json({ show: false });

  const latest = await prisma.seasonRolloverRun.findFirst({
    where: { clubId },
    orderBy: { ranAt: "desc" },
  });
  if (!latest) return NextResponse.json({ show: false });

  const seen = await prisma.userSeasonRolloverSeen.findFirst({
    where: { userId: session.user.id, clubId, seasonYear: latest.seasonYear },
    select: { id: true },
  });

  return NextResponse.json({
    show: !seen,
    run: {
      seasonYear: latest.seasonYear,
      inboundCount: latest.inboundCount,
      outboundCount: latest.outboundCount,
      ranAt: latest.ranAt.toISOString(),
    },
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clubId = getEffectiveClubId(session);
  if (!clubId) return NextResponse.json({ error: "No club selected" }, { status: 400 });

  let body: { seasonYear?: number } | null = null;
  try {
    body = (await request.json()) as any;
  } catch {
    body = null;
  }
  const seasonYear = body?.seasonYear;
  if (!Number.isInteger(seasonYear)) {
    return NextResponse.json({ error: "seasonYear required" }, { status: 400 });
  }

  const seasonYearInt = seasonYear as number;

  await prisma.userSeasonRolloverSeen.upsert({
    where: { userId_clubId_seasonYear: { userId: session.user.id, clubId, seasonYear: seasonYearInt } },
    update: { seenAt: new Date() },
    create: { userId: session.user.id, clubId, seasonYear: seasonYearInt },
  });

  return NextResponse.json({ success: true });
}

