// proxy.ts (renamed from middleware.ts)
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const protectedRoutes = ["/checkout", "/profile"];
const authRoutes      = ["/login", "/signup","/seller-login", "seller-signup", "forgo-password-seller" ,"forgot-password-user"];
const publicRoutes    = ["/home", "/"];

const getSecret = () =>
  new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

async function isValidToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("access_token")?.value;

  console.log('🔵 Token exists:', !!token);

  // ✅ ALWAYS set the pathname header first
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', pathname);

  const authenticated = token ? await isValidToken(token) : false;
  const isProtectedRoute = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAuthRoute      = authRoutes.some((r) => pathname.startsWith(r));
  const isPublicRoute    = publicRoutes.some((r) => pathname === r || pathname.startsWith(r + '/'));
  // const conditionallyAllowed = conditionalRoutes.some((r) => pathname === r || pathname.startsWith(r))


    // Public routes (/, /home)
  if (isPublicRoute) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ALLOWING FOR AUTH ROUTES
  if ( !authenticated && isAuthRoute){
    return NextResponse.next();
  }
  
  // Auth routes (login/signup) - redirect to home if already logged in
  if (isAuthRoute && authenticated) {
      return NextResponse.redirect(new URL("/home", req.url));
    }

  // Protected routes - require authentication
  if (isProtectedRoute) {
    if (!authenticated) {
      const url = new URL("/login", req.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    // ✅ Return response WITH headers
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

 
  // Default - include headers
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    '/',
    '/home',
    '/login',
    '/signup',
    '/profile/:path*',
    '/checkout/:path*',
  ],
};