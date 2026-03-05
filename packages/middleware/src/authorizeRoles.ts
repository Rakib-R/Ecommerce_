
import { AuthError } from "@packages/error-handler";
import { NextFunction, Response } from "express";

// Middleware to restrict access to Sellers only
export const isSeller = (req: any, res: Response, next: NextFunction) => {
  if (req.seller?.role !== "seller") {
    return next(new AuthError("Access denied: Sellers only!"));
  }
  next();
};

// Middleware to restrict access to Users only
export const isBuyer = (req: any, res: Response, next: NextFunction) => {
  if (req.user?.role !== "user") {
    return next(new AuthError("Access denied: Sellers only!"));
  }
  next();
};