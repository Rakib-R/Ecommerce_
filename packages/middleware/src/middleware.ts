
import jwt from "jsonwebtoken";
import { NextFunction, Response } from "express";
import prisma from "@packages/prisma";

export const isAuthenticated = async (
  req: any,  res: Response, 
  next: NextFunction

) => {
  try {
         
  const token =
  req.cookies["access_token"] || 
  req.cookies["seller-access-token"] ||
  req.headers.authorization?.split(" ")[1];

  const decoded = jwt.verify(  token, process.env.JWT_ACCESS_SECRET as string ) as {
      id: string;
      role: "user" | "seller";
  };

  if (!decoded) {
  return res.status(401).json({
      message: "Unauthorized User! Invalid token.",
  });
  }

  let account;
  if (decoded.role === "user") {
    account = await prisma.users.findUnique({
    where: { id: decoded.id },
});
  req.user = {
  ...account,
  role: decoded.role  // ← Add role to user object
};

} else{
  account = await prisma.sellers.findUnique({
    where: { id: decoded.id },
    include: {shop: true}
});
  req.seller = {
  ...account,
  role: decoded.role  // ← Add role to user object
};
}
  if (!account) {
      return res.status(404).json({ message: "Account not found!" });
  }

  req.role = decoded.role;
  return next();
  } 
  catch (error) {
  return res.status(401).json({
      message: "Unauthorized Seller or User Token expired or invalid.",
  });
    
  }
};