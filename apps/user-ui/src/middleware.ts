import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const protectedRoutes = ["/checkout", "/profile"];
const authRoutes      = ["/login", "/signup"];
const publicRoutes    = ["/", "/home"]; 

const getSecret = () =>
  new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

async function isValidToken(token: string): Promise<boolean> {
  try {
    console.log('MIDDLEWARE SECRET LENGTH:', process.env.JWT_ACCESS_SECRET?.length)
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {

  console.log('ALL COOKIES:', req.cookies.getAll());
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("access_token")?.value;
  console.log('TOKEN ',token)

  const isProtectedRoute = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));
  const isPublicRoute = publicRoutes.some((r) => pathname === r || pathname.startsWith(r + '/'));

  const authenticated = token ? await isValidToken(token) : false;
  console.log('Is authenticated:', authenticated);

  //  IMPORTANT: Check auth routes FIRST
  if (isAuthRoute) {
    if (authenticated) {
      console.log('Authenticated user on auth route - redirecting to home');
      return NextResponse.redirect(new URL("/home", req.url));
    }
    console.log('Unauthenticated user on auth route - allowing');
    return NextResponse.next();
  }

  // Then check protected routes
  if (isProtectedRoute) {
    if (!authenticated) {
      console.log('Unauthenticated user on protected route - redirecting to login');
      const url = new URL("/login", req.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    console.log('Authenticated user on protected route - allowing');
    return NextResponse.next();
  }

  // Finally, public routes (always allow)
  if (isPublicRoute) {
    console.log('Public route - allowing');
    return NextResponse.next();
  }

  // Default: allow all other routes
  console.log('Other route - allowing');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/home',
    '/login', 
    '/signup',
    '/profile/:path*',
    '/checkout/:path*',
  ],
};

