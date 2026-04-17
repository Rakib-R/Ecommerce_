
import { Request, Response, NextFunction } from "express";
import { AuthError } from "@packages/error-handler";


declare global {
  namespace Express {
    interface Request {
      role?: 'admin' | 'seller' | 'user';
      admin?: {
        id: string;
        email: string;
      };
      seller?: {
        id: string;
        name: string; 
        role: string;
        shop?: { id: string; name: string; };
      };
      user?: {
         id: string;
        role: string;
        name?: string
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
    // ── 1. Origin / Port Guard ───
    // ────────────────────────────────────────────
    const origin = req.headers.origin || "";
    const originPort = parseInt(origin.split(":")?.[2] || "80");

    const env = (process.env.NODE_ENV as "production" | "development") || "development";
    const allowedOrigins = ALLOWED_ORIGINS[env];
    
    if (origin && !allowedOrigins.some((o) => origin.startsWith(o))) {
        return next(new AuthError("❌ Access denied: Invalid origin."));
      }
      
 
    // -------── 1.9 ---── SUPERIOR TOken XTraction ────────────────────────────────────────
    let token: string | undefined;

      const expectedRole = roleByPort[originPort];
      const tokenNamesToCheck = expectedRole 
      ? ROLE_TOKENS[expectedRole]           // ← seller app only checks seller tokens, user only user's
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
 

    next();
  } catch (error) {
    next(error);
  }
};