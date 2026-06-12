

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@apps/auth-service';

const PUBLIC_ROUTES = ['/login', '/signup', '/home'];
const PRIVATE_ROUTES = ['/checkout'];

export async function middleware(request: NextRequest) {

  const sessionToken = request.cookies.get("better-auth.session_token");
  const { pathname } = request.nextUrl;

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { user } = session;
  
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const IsPrivateRoute = PRIVATE_ROUTES.includes(pathname);

  if (sessionToken && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  if (!user.emailVerified && IsPrivateRoute) {
    return NextResponse.redirect(new URL("/verify-required", request.url));
  }

  if (!sessionToken && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};