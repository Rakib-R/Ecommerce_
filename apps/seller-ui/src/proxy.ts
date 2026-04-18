import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from "jose";


console.log("🚨 MIDDLEWARE EXECUTED", "🚨 MIDDLEWARE EXECUTED",  "🚨 MIDDLEWARE EXECUTED");
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

const isAuthRoute = authRoutes.some((r) => {
  const match = pathname.startsWith(r);
  console.log("🔎 authRoute check:", { r, pathname, match });
  return match;
});

const isProtectedRoute = protectedRoutes.some((route) => {
  const match = pathname.startsWith(route);
  console.log("🔒 protectedRoute check:", { route, pathname, match });
  return match;
});

const isConditionallyAllowed = conditionallyAllowed.some((r) => {
  const match = pathname.startsWith(r);
  console.log("🟡 conditional check:", { r, pathname, match });
  return match;
});


  const authenticated = token ? await isValidToken(token) : false;
  console.log('Is authenticated?:', authenticated);

  console.log("🔥 MIDDLEWARE DEBUG START", {
  pathname,
  token,
});

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
   
    const url = req.nextUrl.clone();
    url.pathname = "/seller-login";
    url.searchParams.set("redirect", pathname);

    return NextResponse.redirect(url);
  }

  console.log({
  pathname,
  isProtectedRoute,
  isConditionallyAllowed,
  isAuthRoute,
  authenticated
});


  // Default - pass through with headers
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
matcher: [
  '/dashboard',
  '/dashboard/:path*',
  '/products',
  '/products/:path*',
  '/orders',
  '/orders/:path*',
  '/seller-login',
  '/seller-signup',
  '/login',
  '/signup',
  '/forgot-password-user', 
  '/forgot-password-seller',
]
};