import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from "jose";

  // Protected routes for seller
  const protectedRoutes = ['/dashboard', '/products', '/orders'];
  const authRoutes      = ['/seller-login', '/seller-signup', 'login', 'signup'];

  const getSecret = () =>
  new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

  async function isValidToken(token: string): Promise<boolean> {
  try {
    console.log('MIDDLEWARE SECRET LENGTH: (seller)', process.env.JWT_ACCESS_SECRET?.length)
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function  middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('seller-access-token')?.value;
  
  const isAuthRoute      = authRoutes.some((r) => pathname.startsWith(r));
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

   const authenticated = token ? await isValidToken(token) : false;
    console.log('Is Seller authenticated ?:', authenticated);
    // console.log('MIDDLEWARE COOKIES (seller):', req.cookies.getAll());

   //  IMPORTANT: Check auth routes FIRST
  if (isAuthRoute) {
    if (authenticated) {
      console.log('Authenticated seller on auth route - redirecting to home');
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    console.log('Unauthenticated seller on auth route - allowing');
    return NextResponse.next();
  }

  // Then check protected routes
  if (isProtectedRoute) {
    if (!authenticated) {
      console.log('Unauthenticated seller on protected route - redirecting to login');
      const url = new URL("/seller-login", req.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
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