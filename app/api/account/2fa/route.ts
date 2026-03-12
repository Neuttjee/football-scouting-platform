import { NextResponse } from "next/server";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import prisma from "@/lib/prisma";
import { getSession, getEffectiveClubId } from "@/lib/auth";
import { getClubConfigByClubId } from "@/lib/clubConfig";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clubId = getEffectiveClubId(session);
  if (!clubId) {
    return NextResponse.json({ error: "Geen club geselecteerd" }, { status: 400 });
  }

  const [user, clubConfig] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorVerifiedAt: true,
      },
    }),
    getClubConfigByClubId(clubId),
  ]);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const hasTwoFactorModule = clubConfig?.features.two_factor_auth ?? false;

  return NextResponse.json({
    hasTwoFactorModule,
    twoFactorEnabled: user.twoFactorEnabled,
    twoFactorVerifiedAt: user.twoFactorVerifiedAt,
    isConfigured: !!user.twoFactorSecret && !!user.twoFactorVerifiedAt,
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clubId = getEffectiveClubId(session);
  if (!clubId) {
    return NextResponse.json({ error: "Geen club geselecteerd" }, { status: 400 });
  }

  const clubConfig = await getClubConfigByClubId(clubId);
  const hasTwoFactorModule = clubConfig?.features.two_factor_auth ?? false;
  if (!hasTwoFactorModule) {
    return NextResponse.json({ error: "2FA module is niet actief voor deze club." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const action = body?.action as "begin-setup" | "verify";

  if (action === "begin-setup") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(
      user.email,
      "Football Scouting Platform",
      secret,
    );
    const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorSecret: secret,
        twoFactorVerifiedAt: null,
      },
    });

    return NextResponse.json({
      otpauthUrl: otpauth,
      qrCodeDataUrl,
    });
  }

  if (action === "verify") {
    const token = (body?.token as string | undefined)?.trim();
    if (!token) {
      return NextResponse.json({ error: "Geen code opgegeven" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorSecret: true },
    });

    if (!user?.twoFactorSecret) {
      return NextResponse.json({ error: "Geen actieve 2FA-setup gevonden" }, { status: 400 });
    }

    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Ongeldige of verlopen code" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorVerifiedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Ongeldige actie" }, { status: 400 });
}

