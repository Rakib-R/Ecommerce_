import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🔓 Clean, centralized list of public routes
const PUBLIC_ROUTES = ['/seller-login', '/seller-signup', '/forgot-password-seller'];

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("better-auth.session_token");
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Helper check to see if the current route is in our public list
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // 1. IF logged in AND trying to access /login or /signup -> send them to /home
  if (sessionToken && (pathname === '/seller-login' || pathname === '/seller-signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // This automatically leaves /home, /login, and /signup accessible!
  if (!sessionToken && !isPublicRoute) {
    return NextResponse.redirect(new URL('/seller-login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
