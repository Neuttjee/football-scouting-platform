import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { generateInviteToken, hashInviteToken } from '@/lib/inviteTokens';
import { sendPasswordResetEmail } from '@/lib/email';
import { isStrongPassword, PASSWORD_POLICY_ERROR } from '@/lib/passwordPolicy';

type RateLimiterEntry = {
  count: number;
  windowEndsAt: number;
};

// Simple in-memory rate limiter.
// Note: This is per process, so limits reset on server restarts.
// Good enough as a baseline for preventing automated email-reset spam.
const passwordResetRateLimiter = new Map<string, RateLimiterEntry>();

function getRequestIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }
  return req.headers.get('x-real-ip') || 'unknown';
}

function consumeRateLimit(req: Request) {
  const ip = getRequestIp(req);

  // Adjust these numbers if needed.
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5; // 5 attempts per window per IP

  const now = Date.now();
  const entry = passwordResetRateLimiter.get(ip);

  if (!entry || now >= entry.windowEndsAt) {
    passwordResetRateLimiter.set(ip, { count: 1, windowEndsAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  passwordResetRateLimiter.set(ip, entry);
  return { allowed: true, remaining: maxRequests - entry.count };
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const rate = consumeRateLimit(req);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Te veel reset-aanvragen. Probeer het later opnieuw.' },
        { status: 429 },
      );
    }

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

    // Wachtwoordregels (server-side afgedwongen)
    if (!isStrongPassword(password)) {
      return NextResponse.json(
        {
          error: PASSWORD_POLICY_ERROR,
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
        sessionVersion: { increment: 1 },
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

// Password policy is centralized in `lib/passwordPolicy.ts`.

