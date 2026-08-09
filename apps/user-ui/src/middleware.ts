import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

const PUBLIC_ROUTES = ['/login', '/signup', '/home'];
const PRIVATE_ROUTES = ['/checkout'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  const sessionToken =
    request.cookies.get('better-auth.session-token')?.value || // 💻 Localhost Development (HTTP)
    request.cookies.get('__Secure-better-auth.session_token')?.value || // 🔒 Production Live Site (HTTPS)
    request.cookies.get('better-auth.session_token')?.value;

  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isPrivateRoute = PRIVATE_ROUTES.includes(pathname);

  // Logged in user trying to access login/signup
  if (sessionToken && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Not logged in trying to access private route
  if (!sessionToken && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // For emailVerified check on private routes - hit a lightweight API route
  if (sessionToken && isPrivateRoute) {
    const verifyRes = await fetch(
      new URL('/api/auth/verify-session', request.url),
      {
        headers: { cookie: request.headers.get('cookie') || '' },
      }
    );
    if (!verifyRes.ok) {
      return NextResponse.redirect(new URL('/verify-required', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|mp4)$).*)',
  ],
};
