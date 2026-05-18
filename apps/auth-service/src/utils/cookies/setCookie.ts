import { Response, CookieOptions } from "express";

export const setCookie = (
  res: Response,
  name: string,
  value: string,
  options?: Partial<CookieOptions>
) => {
  const isProd = process.env.NODE_ENV === "production";

  // 1. Set global structural security rules
  const defaultOptions: CookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  };

  // 2. Automatically assign maxAge based on token name if not manually specified
  let dynamicMaxAge = 7 * 24 * 60 * 60 * 1000; // fallback default (7 days)

  if (name.includes("access_token")) {
    dynamicMaxAge = 15 * 60 * 1000; // 15 minutes
  } else if (name.includes("refresh_token")) {
    dynamicMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  }

  // 3. Clean merge: Incoming options take highest priority
  const cookieOptions = {
    maxAge: dynamicMaxAge,
    ...defaultOptions,
    ...options,
  };

  res.cookie(name, value, cookieOptions);
};
