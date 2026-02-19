
import { Response } from "express";

export const setCookie = (
  res: Response,
  name: string,
  value: string
) => {
  // 7 days in milliseconds
  const maxAge = 7 * 24 * 60 * 60 * 1000;

  res.cookie(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge,
  });
};
