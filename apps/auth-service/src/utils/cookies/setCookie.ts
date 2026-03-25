import { Response, CookieOptions } from "express";

export const setCookie = (
  res: Response,
  name: string,
  value: string,
  options?: Partial<CookieOptions>
) => {
  // Default options with proper typing
  const defaultOptions: CookieOptions = {
    // httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    // sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    // maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // path: "/",
    httpOnly: true,
    secure: false,      //!SHOULD BE FALSE IN DEV MODE AND SAMESITE =lax
    sameSite: "lax", //! NONE ONLY WORKS WITH SECURE==true
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
    domain: undefined
  };

  // Merge defaults with provided options
  const cookieOptions = { ...defaultOptions, ...options };

  res.cookie(name, value, cookieOptions);
};