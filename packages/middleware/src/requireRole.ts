import type { NextFunction, Request, Response } from 'express';

// Define a minimal, decouple shape of your User session object
interface SessionUser {
  role?: 'user' | 'seller';
  emailVerified?: boolean;
}

export function requireRole(allowedRole: 'user' | 'seller') {
  return (req: Request, res: Response, next: NextFunction) => {
    // Auth-service middleware should populate req.user or req.session before reaching this point
    const user = req.user as SessionUser | undefined;

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
