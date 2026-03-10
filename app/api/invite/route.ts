import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, getEffectiveClubId } from '@/lib/auth';
import { sendInviteEmail } from '@/lib/email';
import { generateInviteToken, hashInviteToken } from '@/lib/inviteTokens';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPERADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const clubId = getEffectiveClubId(session);
    if (!clubId) {
      return NextResponse.json({ error: 'Geen club geselecteerd' }, { status: 400 });
    }

    const { email, name, role } = await req.json();
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const [settings, activeUserCount] = await Promise.all([
      prisma.clubSettings.findUnique({ where: { clubId } }),
      prisma.user.count({ where: { clubId, isActive: true } }),
    ]);

    const maxUsers = settings?.maxUsers ?? 999;
    if (activeUserCount >= maxUsers) {
      return NextResponse.json(
        {
          error:
            'Maximaal aantal gebruikers voor deze club is bereikt. Verhoog het maximum in het superadmin clubprofiel of deactiveer bestaande gebruikers.',
        },
        { status: 400 },
      );
    }

    const inviteToken = generateInviteToken();
    const inviteTokenHash = hashInviteToken(inviteToken);
    const inviteTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        clubId,
        inviteToken: inviteTokenHash,
        inviteTokenExpires,
      },
    });

    const club = await prisma.club.findUnique({ where: { id: clubId }, select: { name: true } });

    await sendInviteEmail(email, inviteToken, role, club?.name || null);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { token, password, name } = await req.json();
    
    const tokenHash = hashInviteToken(token);
    const user = await prisma.user.findUnique({ where: { inviteToken: tokenHash } });
    if (!user || !user.inviteTokenExpires || user.inviteTokenExpires < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name || user.name,
        passwordHash,
        inviteToken: null,
        inviteTokenExpires: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
