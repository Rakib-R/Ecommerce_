import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🔓 Clean, centralized list of public routes
const PUBLIC_ROUTES = [
  '/seller-login',
  '/seller-signup',
  '/forgot-password-seller',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass API routes immediately
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 2. Fetch session tokens (Checks both Localhost and Production cookie formats)
  const sessionToken =
    request.cookies.get('better-auth.session-token')?.value ||
    request.cookies.get('better-auth.session_token')?.value ||
    request.cookies.get('__Secure-better-auth.session_token')?.value;

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // 3. IF NOT logged in AND trying to access a protected dashboard route
  if (!sessionToken && !isPublicRoute) {
    return NextResponse.redirect(new URL('/seller-login', request.url));
  }

  // 4. IF logged in AND trying to access auth screens -> send them away to dashboard
  if (sessionToken && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|mp4)$).*)',
  ],
};
