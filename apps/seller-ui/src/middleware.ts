import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('seller-access-token')?.value;
  
  // Protected routes for seller
  const protectedRoutes = ['/dashboard', '/products', '/orders'];
  const authRoutes      = ['/seller-login', '/seller-signup'];
  
  const isAuthRoute      = authRoutes.some((r) => pathname.startsWith(r));
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    // Redirect to SELLER login, not user login
    return NextResponse.redirect(new URL('/seller-login', req.url));
  }
  
  // If on login page but already authenticated, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  return NextResponse.next();
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