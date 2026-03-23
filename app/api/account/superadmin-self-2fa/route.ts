import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, setSession } from "@/lib/auth";
import { getClubConfigByClubId } from "@/lib/clubConfig";

type SuperadminSelfTwoFactorResponse = {
  twoFactorEnabled: boolean;
  hasTwoFactorModule: boolean;
  isConfigured: boolean;
};

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const [user, clubConfig] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorEnabled: true, twoFactorSecret: true, twoFactorVerifiedAt: true },
    }),
    getClubConfigByClubId(session.user.clubId),
  ]);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const hasTwoFactorModule = Boolean(clubConfig?.features.two_factor_auth ?? false);
  const isConfigured = Boolean(user.twoFactorSecret && user.twoFactorVerifiedAt);

  const response: SuperadminSelfTwoFactorResponse = {
    twoFactorEnabled: Boolean(user.twoFactorEnabled),
    hasTwoFactorModule,
    isConfigured,
  };

  return NextResponse.json(response);
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const enabled = body?.enabled;
    if (typeof enabled !== "boolean") {
      return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
    }

    const [user, clubConfig] = await Promise.all([
      prisma.user.update({
        where: { id: session.user.id },
        data: { twoFactorEnabled: enabled },
        select: { twoFactorEnabled: true, twoFactorSecret: true, twoFactorVerifiedAt: true },
      }),
      getClubConfigByClubId(session.user.clubId),
    ]);

    const hasTwoFactorModule = Boolean(clubConfig?.features.two_factor_auth ?? false);
    const isConfigured = Boolean(user.twoFactorSecret && user.twoFactorVerifiedAt);

    const response: SuperadminSelfTwoFactorResponse = {
      twoFactorEnabled: Boolean(user.twoFactorEnabled),
      hasTwoFactorModule,
      isConfigured,
    };

    await setSession({
      ...session.user,
      twoFactorSetupRequired: hasTwoFactorModule && !isConfigured,
    });

    return NextResponse.json({ success: true, ...response });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

