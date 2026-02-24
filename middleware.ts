import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession, decrypt } from './lib/auth';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // Paths that don't require auth
  if (
    pathname.startsWith('/api/auth') || 
    pathname.startsWith('/api/invite') && request.method === 'PUT' || // allow accepting invite without auth
    pathname === '/login' ||
    pathname === '/accept-invite' ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // API Routes
  if (pathname.startsWith('/api/')) {
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payload = await decrypt(session);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Pages
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await decrypt(session);
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Update session expiration
  return await updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
