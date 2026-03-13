import { NextResponse } from "next/server";
import { getSession, getEffectiveClubId } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clubId = getEffectiveClubId(session);
  if (!clubId) {
    return NextResponse.json({ error: "Geen club geselecteerd" }, { status: 400 });
  }

  const url = new URL(req.url);
  const searchParams = url.searchParams;

  const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10) || 1, 1);
  const rawPageSize = parseInt(searchParams.get("pageSize") ?? "50", 10) || 50;
  const pageSize = Math.min(Math.max(rawPageSize, 1), 100);
  const skip = (page - 1) * pageSize;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: { clubId },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" as any },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        passwordHash: true,
        inviteToken: true,
        inviteTokenExpires: true,
        lastLoginAt: true,
        twoFactorEnabled: true,
        twoFactorVerifiedAt: true,
        twoFactorResetAt: true,
      },
    }),
    prisma.user.count({ where: { clubId } }),
  ]);

  return NextResponse.json({
    users,
    total,
    page,
    pageSize,
  });
}

