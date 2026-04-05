
import { AuthError } from "@packages/error-handler";
import { NextFunction, Response } from "express";

// Middleware to restrict access to Sellers only
export const isSeller = (req: any, res: Response, next: NextFunction) => {
  if (req.seller?.role !== "seller" && req.admin?.role !== 'admin') {
    return next(new AuthError("Access denied: Only for Admin and Sellers!"));
  }
  next();
};

// Middleware to restrict access to Users only
export const isBuyer = (req: any, res: Response, next: NextFunction) => {
  if (req.user?.role !== "user" && req.admin?.role !== 'admin') {
    return next(new AuthError("Access denied: Only for Admin and Buyers !"));
  }
  next();
};