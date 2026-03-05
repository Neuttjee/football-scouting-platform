import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ players: [] });

  const players = await prisma.player.findMany({
    where: {
      clubId: session.user.clubId,
      name: { contains: q, mode: "insensitive" },
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
    take: 20,
  });

  return NextResponse.json({ players });
}

