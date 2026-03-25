
import { Request, Response, NextFunction } from "express";
import { AuthError } from "@packages/error-handler";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
        seller?: {
        id: string;
        role: string;
      };
    }
  }
}

const ALLOWED_ORIGINS: Record<"production" | "development", string[]> = {
  production: ["https://yourdomain.com", "https://www.yourdomain.com"],
  development: [
      "http://192.168.0.105:3000","http://192.168.0.105:3000",
      "http://localhost:3000", "http://localhost:4000",
      "http://localhost:9999", "http://localhost:3000", "http://localhost:4000",],
};

const ROLE_PORT_MAP: Record<string, number[]> = {
  user:   [3000],
  seller: [4000],
  admin:  [9999],
};

// ✅ Only look for tokens that belong to this port's role
const roleByPort: Record<number, string> = {
  3000: 'user',
  4000: 'seller',
  9999: 'admin',
}

const ROLE_TOKENS: Record<string, string[]> = {
  user:   ['access_token'],
  seller: ['seller-access-token'],
  admin:  ['admin-access-token', 'admin-refresh-token'],
};


export const globalMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // ── 1. Origin / Port Guard ───────────────────────────────────────────────
    // const env = (process.env.NODE_ENV as "production" | "development") || "development";
    
    // const allowedOrigins = ALLOWED_ORIGINS[env];
    
    // if (origin && !allowedOrigins.some((o) => origin.startsWith(o))) {
      //   return next(new AuthError("Access denied: Invalid origin."));
      // }
      
    const origin = req.headers.origin || "";
    const originPort = parseInt(origin.split(":")?.[2] || "80");

    // -------── 1.9 ---── SUPERIOR TOken XTraction ────────────────────────────────────────
    let token: string | undefined;

      const expectedRole = roleByPort[originPort];
      const tokenNamesToCheck = expectedRole 
      ? ROLE_TOKENS[expectedRole]           // ← seller app only checks seller tokens
      : Object.values(ROLE_TOKENS).flat();
      
    // Only check tokens relevant to this app's role
      let tokenFromCookie: string | undefined;
      if (req.cookies) {
        for (const tokenName of tokenNamesToCheck) {
          if (req.cookies[tokenName]) {
            tokenFromCookie = req.cookies[tokenName];
            break;
          }
        }
      }
    
    const authHeader = req.headers.authorization;
     const tokenFromHeader = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;

     token = tokenFromCookie ?? tokenFromHeader;
    if (!token) return next(); // unauthenticated requests pass through
    
    // Check cookies first
    if (req.cookies) {
      for (const tokenName of Object.values(ROLE_TOKENS).flat()) {
          if (req.cookies[tokenName]) {
            tokenFromCookie = req.cookies[tokenName];
            break;
          }
      }
    }
 
    // ── 3. Verify & Decode Token ─────────────────────────────────────────────
    let decoded = jwt.decode(token) as any;
    try {
        // console.log('TOKEN EXPIRED?', decoded?.exp < Math.floor(Date.now() / 1000));
        // console.log('SECRET LENGTH:', process.env.JWT_ACCESS_SECRET?.length);
        // console.log('SECRET PREVIEW:', process.env.JWT_ACCESS_SECRET?.slice(0, 6));
        decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
      } catch (error) {

        if (error instanceof jwt.TokenExpiredError) {
          return next();
      }
      return next(new AuthError("Access denied: Invalid or expired token."));
    }

    // ── 4. Token Type Validation ─────────────────────────────────────────────
    let expectedTokens: string[] | undefined

    if (decoded.role && req.cookies) {
       expectedTokens = ROLE_TOKENS[decoded.role];
      const hasValidToken = expectedTokens?.some(tokenName => req.cookies?.[tokenName]);
      
      if (expectedTokens && !hasValidToken && Object.keys(req.cookies).length > 0) {
        return next(new AuthError(`Access denied: Unknown error for role ${decoded.role}.`));
      }
    }

    // ── 5. Role Tampering Guard ───────────────────────────────────────────────
    if (req.body?.role || req.query?.role) {
      const injectedRole = req.body?.role || req.query?.role;
      if (injectedRole !== decoded.role) {
        return next(new AuthError("Access denied: Role manipulation detected."));
      }
      // Clean up
      if (req.body?.role) delete req.body.role;
      if (req.query?.role) delete req.query.role;
    }

  // ── 7. Attach clean user to request ──────────────────────────────────────
  const payload = {
    id: decoded.id,
    role: decoded.role,
  };

  if (decoded.role === 'seller') {
      req.seller = payload;
  } else if (decoded.role === 'user') {
      req.user = payload;
  } else if (decoded.role === 'admin') {
      req.user = payload; // or req.admin if you add that too
  }

   

    next();
  } catch (error) {
    next(error);
  }
};