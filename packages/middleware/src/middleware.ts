import jwt from "jsonwebtoken";
import { NextFunction, Response } from "express";
import prisma from "@packages/prisma";

export const isAuthenticated = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check all possible tokens (supports all roles)
    const token =
      req.cookies["access_token"] ||           // Regular user token
      req.cookies["seller-access-token"] ||    // Seller token
      req.cookies["admin-access-token"] ||     // Admin token
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized! No token provided.",
      });
    }

    // Decode the token to get role first (without verification)
    const decodedToken = jwt.decode(token) as {
      id: string;
      role: "user" | "seller" | "admin";
    };

    if (!decodedToken || !decodedToken.role) {
      return res.status(401).json({
        message: "Invalid token format!",
      });
    }

    // Verify token based on role (using appropriate secret)
    let decoded;

      // Try verifying with the main access secret first
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as {
        id: string;
        role: "user" | "seller" | "admin";
    }

    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized! Invalid token.",
      });
    }

    // Fetch account based on role
    let account = null;
    
    if (decoded.role === "user") {
      account = await prisma.users.findUnique({
        where: { id: decoded.id },
        
        include: {
          avatar: true,    // Include avatar images
          order: true,
          analytics: true,
          following: true,
        }
      });
      
      if (account) {
        req.user = {
          ...account,
          role: decoded.role,
        };
      }
    } 
    else if (decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include : {
          shop : true,
          discount_codes: true,
          productDiscounts : true
        }
    });
      
      if (account) {
        req.seller = {
          ...account,
          role: decoded.role,
        };
      }
    }
    else if (decoded.role === "admin") {
      account = {
        id: decoded.id,
        role: "admin",
      };
      
      req.admin = {
        ...account,
        role: decoded.role,
      };
    }

    if (!account) {
      return res.status(404).json({ 
        message: "Account not found!" 
      });
    }

    // Set common user info for all roles
    req.userInfo = {
      id: decoded.id,
      role: decoded.role,
    };
    
    req.role = decoded.role;
    
    // console.log("Request Role : ", req.role , 'Req Userinfo-> ', req.userInfo, 'Req Headers => ',)
    return next();
  } catch (error) {
      console.error("Authentication error fron -------------isAuthenticated --------- :", error);
      return res.status(401).json({
      message: "Unauthorized! Token expired or invalid.",
    });
  }
};

// Role-specific middleware functions
export const requireUser = (req: any, res: Response, next: NextFunction) => {
  if (req.role === "admin") {
    // Admin can access user routes
    return next();
  }
  
  if (req.role !== "user") {
    return res.status(403).json({
      message: "Access denied! Users only.",
    });
  }
  
  next();
};

export const requireSeller = (req: any, res: Response, next: NextFunction) => {
  if (req.role === "admin") {
    // Admin can access seller routes
    return next();
  }
  
  if (req.role !== "seller") {
    return res.status(403).json({
      message: "Access denied! Sellers only.",
    });
  }
  
  next();
};

export const requireAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "admin") {
    return res.status(403).json({
      message: "Access denied! Admins only.",
    });
  }
  
  next();
};
