import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/session';

/**
 * Gate every /admin route behind a valid session.
 *
 * The check lives in middleware so an unauthenticated request never reaches a
 * page or a Server Action — the admin UI is not merely hidden, it is not
 * rendered. Server Actions re-check the session independently (defence in
 * depth); middleware alone is not treated as the authorisation boundary.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  // The login page is the one admin route reachable without a session.
  if (pathname === '/admin/belepes') {
    if (session) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const login = new URL('/admin/belepes', request.url);
    // Remember where they were headed, but only ever an internal path.
    if (pathname !== '/admin') {
      login.searchParams.set('tovabb', pathname);
    }
    const response = NextResponse.redirect(login);
    // A stale or forged cookie is cleared so the browser stops sending it.
    if (token) response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
