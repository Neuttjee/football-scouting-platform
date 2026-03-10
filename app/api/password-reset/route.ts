import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { generateInviteToken, hashInviteToken } from '@/lib/inviteTokens';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Altijd succes teruggeven, ook als user niet bestaat, om enumerate niet mogelijk te maken
    if (!user || !user.isActive || !user.passwordHash) {
      return NextResponse.json({ success: true });
    }

    const rawToken = generateInviteToken();
    const tokenHash = hashInviteToken(rawToken);
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minuten

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: tokenHash,
        passwordResetExpires: expires,
      },
    });

    await sendPasswordResetEmail(user.email, rawToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Ongeldige token' }, { status: 400 });
    }
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Ongeldig wachtwoord' }, { status: 400 });
    }

    // Basis wachtzinregels (ook server-side afgedwongen)
    if (!isStrongPassphrase(password)) {
      return NextResponse.json(
        {
          error:
            'Gebruik een sterke wachtzin van minimaal 16 tekens en 4 woorden.',
        },
        { status: 400 },
      );
    }

    const tokenHash = hashInviteToken(token);

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: tokenHash,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Ongeldige of verlopen resetlink' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

function isStrongPassphrase(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 16) return false;
  const words = trimmed.split(/\s+/);
  if (words.length < 4) return false;
  const hasLetter = /[A-Za-z]/.test(trimmed);
  if (!hasLetter) return false;
  return true;
}

