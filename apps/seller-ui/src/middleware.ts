import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from "jose";

// Protected routes for seller
const protectedRoutes = ['/dashboard', '/products', '/orders'];
const authRoutes = ['/seller-login', '/seller-signup', '/login', '/signup', '/forgot-password-user', '/forgot-password-seller'];
const conditionallyAllowed = ['/seller-login', '/seller-signup', '/forgot-password-seller', '/login', '/signup', '/forgot-password-user'];

const getSecret = () =>
  new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

async function isValidToken(token: string): Promise<boolean> {
  try {
    // console.log('MIDDLEWARE SECRET LENGTH:', process.env.JWT_ACCESS_SECRET?.length);
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('seller-access-token')?.value || req.cookies.get('admin-access-token')?.value;
  
  // Set pathname header
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', pathname);

  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isConditionallyAllowed = conditionallyAllowed.some((r) => pathname.startsWith(r));

  const authenticated = token ? await isValidToken(token) : false;
  console.log('Is authenticated?:', authenticated);

  // Allow unauthenticated requests to conditionally allowed routes
  if (!authenticated && isConditionallyAllowed) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Auth routes - redirect to dashboard if already authenticated
  if (isAuthRoute && authenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Protected routes - require authentication
  if (isProtectedRoute && !authenticated) {
    console.log('Unauthenticated on protected route - redirecting to login');
    const url = new URL("/seller-login", req.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Default - pass through with headers
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/products/:path*',
    '/orders/:path*',
    '/seller-login',
    '/seller-signup',
  ]
};