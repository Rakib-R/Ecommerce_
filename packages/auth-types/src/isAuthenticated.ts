import type { NextFunction, Request, Response } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../src/auth/index';

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!result) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    req.user = result.user as typeof req.user;
    req.session = result.session as typeof req.session;
    return next();
  } catch (err) {
    return next(err);
  }
}
