import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@packages/auth-types';
// Define a minimal, decouple shape of your User session object

export function requireRole(allowedRole: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Auth-service middleware should populate req.user or req.session before reaching this point
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (user.role !== allowedRole) {
      return res.status(403).json({
        success: false,
        message: 'Mismatch Entity Role. Have to match Seller or Buyer',
      });
    }

    if (allowedRole === 'seller' && !user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email not verified',
      });
    }

    return next();
  };
}
