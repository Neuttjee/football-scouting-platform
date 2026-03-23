import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getEffectiveClubId, getSession, setSession } from "@/lib/auth";

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

    const effectiveClubId = getEffectiveClubId(session as any);
    const clubIds = new Set<string>();

    // SUPERADMIN hoort altijd bij Platform (via user.clubId) => nodig om hun eigen login-vereiste consistent te houden.
    if (session.user.clubId) clubIds.add(session.user.clubId);
    if (effectiveClubId) clubIds.add(effectiveClubId);

    await prisma.$transaction(async (tx) => {
      for (const clubId of clubIds) {
        await tx.clubFeature.upsert({
          where: {
            clubId_key: {
              clubId,
              key: "two_factor_auth",
            },
          },
          create: {
            clubId,
            key: "two_factor_auth",
            enabled,
          },
          update: {
            enabled,
          },
        });

        if (enabled) {
          // Zet "required" alleen voor gebruikers die al een geverifieerde TOTP hebben.
          await tx.user.updateMany({
            where: {
              clubId,
              isActive: true,
              passwordHash: { not: null },
              twoFactorSecret: { not: null },
              twoFactorVerifiedAt: { not: null },
            },
            data: { twoFactorEnabled: true },
          });

          // En zet het uit voor accounts die (nog) geen TOTP hebben.
          await tx.user.updateMany({
            where: {
              clubId,
              isActive: true,
              passwordHash: { not: null },
              OR: [{ twoFactorSecret: null }, { twoFactorVerifiedAt: null }],
            },
            data: { twoFactorEnabled: false },
          });
        } else {
          // Bij uit zetten: maak overal "niet verplicht".
          await tx.user.updateMany({
            where: {
              clubId,
              isActive: true,
              passwordHash: { not: null },
            },
            data: { twoFactorEnabled: false },
          });
        }
      }
    });

    const self = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorSecret: true, twoFactorVerifiedAt: true },
    });
    const isConfigured = Boolean(self?.twoFactorSecret && self?.twoFactorVerifiedAt);
    await setSession({
      ...session.user,
      twoFactorSetupRequired: enabled && !isConfigured,
    });

    return NextResponse.json({ success: true, enabled });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

