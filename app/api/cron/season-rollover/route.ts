import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function getCurrentSeasonStartYear(now: Date) {
  const y = now.getFullYear();
  const m = now.getMonth();
  return m >= 6 ? y : y - 1;
}

function isJulyFirstUTC(now: Date) {
  return now.getUTCMonth() === 6 && now.getUTCDate() === 1;
}

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") || "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  if (!isJulyFirstUTC(now)) {
    return NextResponse.json({ skipped: true, reason: "Not July 1 (UTC)" });
  }

  const seasonYear = getCurrentSeasonStartYear(now);
  const seasonStart = new Date(Date.UTC(seasonYear, 6, 1, 0, 0, 0));
  const seasonEnd = new Date(Date.UTC(seasonYear + 1, 5, 30, 0, 0, 0));

  const clubs = await prisma.club.findMany({
    select: { id: true, name: true },
  });

  const results: {
    clubId: string;
    seasonYear: number;
    inbound: number;
    outbound: number;
    alreadyRan: boolean;
  }[] = [];

  for (const club of clubs) {
    const existing = await prisma.seasonRolloverRun.findUnique({
      where: { clubId_seasonYear: { clubId: club.id, seasonYear } },
      select: { id: true },
    });
    if (existing) {
      results.push({ clubId: club.id, seasonYear, inbound: 0, outbound: 0, alreadyRan: true });
      continue;
    }

    const inboundCandidates = await prisma.player.findMany({
      where: {
        clubId: club.id,
        type: "EXTERNAL",
        plannedInternalFromSeasonYear: { lte: seasonYear },
      },
      select: { id: true, plannedInternalTeamId: true },
    });

    const inbound = inboundCandidates.filter((p) => !!p.plannedInternalTeamId);
    const inboundMissingTeam = inboundCandidates.filter((p) => !p.plannedInternalTeamId);

    const inboundTeamIds = Array.from(new Set(inbound.map((p) => p.plannedInternalTeamId!)));
    const teams = inboundTeamIds.length
      ? await prisma.team.findMany({
          where: { clubId: club.id, id: { in: inboundTeamIds } },
          select: { id: true, name: true, code: true },
        })
      : [];
    const teamById = Object.fromEntries(teams.map((t) => [t.id, t]));

    // Outbound: internal players with contract ended before season start and no optionYear.
    const outboundCandidates = await prisma.player.findMany({
      where: {
        clubId: club.id,
        type: "INTERNAL",
        optionYear: false,
        contractEndDate: { lt: seasonStart },
      },
      select: { id: true },
    });

    await prisma.$transaction(async (tx) => {
      // inbound conversions (only those with a valid team)
      for (const p of inbound) {
        const team = teamById[p.plannedInternalTeamId!];
        if (!team) continue;
        await tx.player.update({
          where: { id: p.id },
          data: {
            type: "INTERNAL",
            currentClub: club.name,
            teamId: team.id,
            team: team.code || team.name,
            joinedAt: seasonStart,
            contractEndDate: seasonEnd,
            plannedInternalFromSeasonYear: null,
            plannedInternalTeamId: null,
          },
        });
      }

      // outbound conversions
      if (outboundCandidates.length) {
        await tx.player.updateMany({
          where: { id: { in: outboundCandidates.map((p) => p.id) } },
          data: {
            type: "EXTERNAL",
            teamId: null,
            team: null,
            joinedAt: null,
            contractEndDate: null,
            optionYear: false,
            distanceFromClubKm: null,
          },
        });
      }

      // Record run
      await tx.seasonRolloverRun.create({
        data: {
          clubId: club.id,
          seasonYear,
          inboundCount: inbound.length,
          outboundCount: outboundCandidates.length,
        },
      });
    });

    results.push({
      clubId: club.id,
      seasonYear,
      inbound: inbound.length,
      outbound: outboundCandidates.length,
      alreadyRan: false,
    });

    // We intentionally do not fail the whole run due to missing planned team.
    if (inboundMissingTeam.length) {
      // Optionally: could write an AuditLog here in the future.
    }
  }

  return NextResponse.json({ success: true, seasonYear, results });
}

