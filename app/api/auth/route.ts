import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { setSession, clearSession, decrypt } from '@/lib/auth';
import { getClubConfigByClubId } from '@/lib/clubConfig';
import { authenticator } from 'otplib';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'logout') {
      await clearSession();
      return NextResponse.json({ success: true });
    }

    if (action === 'login') {
      const { email, password } = body;
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.isActive || !user.passwordHash) {
        return NextResponse.json({ error: 'Ongeldige logingegevens' }, { status: 401 });
      }

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        return NextResponse.json({ error: 'Ongeldige logingegevens' }, { status: 401 });
      }

      const clubConfig = await getClubConfigByClubId(user.clubId);
      const hasTwoFactorModule = clubConfig?.features.two_factor_auth ?? false;
      const requiresTwoFactor =
        hasTwoFactorModule &&
        !!user.twoFactorEnabled &&
        !!user.twoFactorSecret &&
        !!user.twoFactorVerifiedAt;

      if (!requiresTwoFactor) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            loginCount: { increment: 1 },
            lastLoginAt: new Date(),
          },
        });

        await setSession({
          id: user.id,
          email: user.email,
          role: user.role,
          clubId: user.clubId,
        });

        return NextResponse.json({ success: true, user: { id: user.id, name: user.name, role: user.role } });
      }

      const cookieStore = await cookies();
      cookieStore.set('twofa_pending', JSON.stringify({ userId: user.id }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 5 * 60,
      });

      return NextResponse.json({
        success: true,
        twoFactorRequired: true,
      });
    }

    if (action === 'verify-2fa') {
      const { token } = body;
      const cookieStore = await cookies();
      const pending = cookieStore.get('twofa_pending')?.value;
      if (!pending) {
        return NextResponse.json({ error: 'Geen lopende 2FA-sessie gevonden.' }, { status: 400 });
      }

      let parsed: { userId: string } | null = null;
      try {
        parsed = JSON.parse(pending) as { userId: string };
      } catch {
        parsed = null;
      }
      if (!parsed?.userId) {
        cookieStore.delete('twofa_pending');
        return NextResponse.json({ error: 'Ongeldige 2FA-sessie.' }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { id: parsed.userId },
      });

      if (
        !user ||
        !user.isActive ||
        !user.twoFactorEnabled ||
        !user.twoFactorSecret ||
        !user.twoFactorVerifiedAt
      ) {
        cookieStore.delete('twofa_pending');
        return NextResponse.json({ error: '2FA is niet (meer) vereist voor dit account.' }, { status: 400 });
      }

      const isValid = authenticator.verify({
        token: String(token ?? '').trim(),
        secret: user.twoFactorSecret,
      });

      if (!isValid) {
        return NextResponse.json({ error: 'Ongeldige of verlopen 2FA-code.' }, { status: 401 });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginCount: { increment: 1 },
          lastLoginAt: new Date(),
        },
      });

      await setSession({
        id: user.id,
        email: user.email,
        role: user.role,
        clubId: user.clubId,
      });

      cookieStore.delete('twofa_pending');

      return NextResponse.json({
        success: true,
        user: { id: user.id, name: user.name, role: user.role },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
