import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const secretKey = process.env.SESSION_SECRET || 'fallback-secret-key-that-is-at-least-32-chars-long';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

const SUPERADMIN_ACTIVE_CLUB_COOKIE = 'superadmin_active_club_id';

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;
  const payload = await decrypt(session);
  if (!payload) return null;
  if (payload.user?.role === 'SUPERADMIN') {
    const activeClubId = cookieStore.get(SUPERADMIN_ACTIVE_CLUB_COOKIE)?.value ?? undefined;
    return { ...payload, activeClubId };
  }
  return payload;
}

/** Club ID to use for data (players, tasks, etc.). For SUPERADMIN: only the selected club (null until they pick one). */
export function getEffectiveClubId(session: { user: { role: string; clubId: string }; activeClubId?: string } | null): string | null {
  if (!session?.user?.clubId) return null;
  if (session.user.role === 'SUPERADMIN') return session.activeClubId ?? null;
  return session.user.clubId;
}

export async function setActiveClubId(clubId: string | null) {
  const cookieStore = await cookies();
  if (clubId) {
    cookieStore.set(SUPERADMIN_ACTIVE_CLUB_COOKIE, clubId, { path: '/', maxAge: 60 * 60 * 24 * 7 }); // 7 days
  } else {
    cookieStore.delete(SUPERADMIN_ACTIVE_CLUB_COOKIE);
  }
}

export async function setSession(user: any) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const session = await encrypt({ user, expires });

  (await cookies()).set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expires,
    sameSite: 'lax',
    path: '/',
  });
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  if (!session) return NextResponse.next();

  const payload = await decrypt(session);
  if (!payload) return NextResponse.next();

  const res = NextResponse.next();
  res.cookies.set({
    name: 'session',
    value: session,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60, // 24 hours
  });
  return res;
}

export async function clearSession() {
  (await cookies()).set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    sameSite: 'lax',
    path: '/',
  });
}
