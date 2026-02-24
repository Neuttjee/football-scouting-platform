import { NextRequest, NextResponse } from 'next/server'
import { auth } from './auth'

export async function middleware(req: NextRequest) {
  const session = await auth()
  const isLoggedIn = !!session

  const { pathname } = req.nextUrl

  // Protected routes check
  if (
    !isLoggedIn &&
    pathname !== '/login' &&
    !pathname.startsWith('/api/auth') &&
    !pathname.startsWith('/invite')
  ) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isLoggedIn && pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Role based checks
  if (pathname.startsWith('/instellingen')) {
    if (session?.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
