import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calculateAgeFromDate } from "@/lib/age";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ players: [] });

  const playersRaw = await prisma.player.findMany({
    where: {
      clubId: session.user.clubId,
      name: { contains: q, mode: "insensitive" },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      currentClub: true,
      position: true,
      dateOfBirth: true,
      age: true,
    },
    take: 20,
  });

  const players = playersRaw.map((p) => ({
    id: p.id,
    name: p.name,
    currentClub: p.currentClub,
    position: p.position,
    age: p.dateOfBirth ? calculateAgeFromDate(p.dateOfBirth) : p.age ?? null,
  }));

  return NextResponse.json({ players });
}

