
import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, handleForgotPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyForgotPasswordOtp, verifyOtp } from "../utils/auth.helper";
import { AppError, AuthError, ValidationError } from "@packages/error-handler";
import prisma from "@packages/prisma";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken"
import { setCookie } from "../utils/cookies/setCookie";


export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "buyer");
    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({
      where: { email},
    });

    if (existingUser) {
      // Use 'return next' to exit the function immediately
      throw new AppError("User already exists with this email!", 400);
    }

    await checkOtpRestrictions(email,next);
    await trackOtpRequests(email, next);
    await sendOtp (name,email, 'user-activation-mail');

    res.status(200).json({
      message: "OTP sent to email. Pls verify"
    });
  } catch (error) {
    // Pass the actual error object to your error middleware
    next(error);
  }
};


// verify user with OTP
export const verifyUser = async (
  req: Request, res: Response, next: NextFunction
) => {
  try {
    const { email, otp, name, password } = req.body;

  if (!email || !password || !otp || !name) {
     throw new AppError('Fields are required!', 400);
    }
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('Buyer already exists with this email!', 409);
    }
    await verifyOtp(email, otp, next);
    
    const hashedPassword = await bcrypt.hash(password, 10);

     await prisma.users.create({
       data: { name, email, password: hashedPassword } });
      
      res.status(201).json({
        success: true,
        message: "User registered Successfully"
      })

  } catch (error) {
    return next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError("Email and password are required!"));
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return next(new AuthError("User doesn't exist!"));
    const isMatch = await bcrypt.compare(password, user.password!);

      if (!isMatch) {
        return next(new ValidationError("Invalid email or password!"));
      }

      if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
      return next(new AuthError("Internal Server Error: Missing Token Secrets"));
    }
      const accessToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: "15m" }
    );

    // Generate refresh token if needed
      const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: "7d" }
    );

    setCookie(res, "refreshToken", refreshToken);
    setCookie(res, "accessToken", accessToken);

    res.status(200).json({ message: "Login successful!", 
      user: { id: user.id, name: user.name, email: user.email } 
    });
  
  } catch (error) {
    return next(error);
    }
};

// Refresh Token - User
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      throw new ValidationError("Unauthorized! No refresh token.");
    }

    const decoded = jwt.verify(
      refreshToken, 
      process.env.REFRESH_TOKEN_SECRET as string
    ) as any;
    
    if (!decoded || !decoded.id || !decoded.role) {
    return new JsonWebTokenError("Forbidden! Invalid refresh token.");
  }

    // let account;
    // if (decoded.role === "user") {
    const user = await prisma.users.findUnique({ where: { id: decoded.id },  });
    if (!user) {
    return new AuthError("Forbidden! User/Seller not found");
  }
    const accessToken = jwt.sign(
      { id: decoded.id }, 
      process.env.ACCESS_TOKEN_SECRET as string, 
      { expiresIn: "15m" }
    );
    
    setCookie(res, "access_token", accessToken);
      
    return res.status(201).json({ success: true }); 
    } catch (error) { 
     return next(error); 
    }
};
  export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    res.status(201).json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
}
export const userForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  await  handleForgotPassword(req, res, next, "buyer");
};

// Verify forgot password OTP
export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => await verifyForgotPasswordOtp(req, res, next);

export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      throw new ValidationError("Email and new password are required!");

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return next(new ValidationError("User not found!"));

    // compare new password with the existing one
    const isSamePassword = await bcrypt.compare(newPassword, user.password!);
    if (isSamePassword)
      throw new ValidationError("New password cannot be the same as the old password!");
    
    // hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.users.update({
        where: { email },
        data: { password: hashedPassword },
      });
      
    res.status(200).json({ message: "Password reset successfully!" });

  } catch (error) {
    return next(error);
  }
};

//TODO  REGISTER NEW SELLER  REGISTER NEW SELLER


export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate incoming data
    validateRegistrationData(req.body, "seller");
    const { name, email } = req.body

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingSeller) {
      throw new ValidationError("Seller already exists with this email!");
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);  
    await sendOtp(name, email, 'seller-activation');
     res.status(200).json({
        message: "OTP sent to email. Please verify your account."
      });
    } catch (error) {
      next(error); // Pass errors to the error handler
  }
};

// verify seller with OTP
export const verifySeller = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, password, name, phone_number, country } = req.body;

    if (!email || !otp || !password || !name || !phone_number || !country) {
      return next (new ValidationError('All fields are required'))
    }
    
    const existingSeller = await prisma.sellers.findUnique({ where : { email }});
    if (existingSeller){
      new ValidationError('Seller already exists with this email!')
    }
    const hashedPassword = await bcrypt.hash(password, 10);

      const seller = await prisma.sellers.create({
        data: {
          name,
          email,
          password: hashedPassword,
          country,
          phone_number,
        },
      });
       res.status(201).json({
        seller,
        message: "Seller registered successfully!"
      });
    await verifyOtp(email, otp, next);
  } catch (error) {
    next(error);
  }
};

// Create shop
export const createShop = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } = req.body;

    if (
      !name || !bio || !address || !sellerId || !opening_hours || !category
    ) {
      return next (new ValidationError('All fields are required!'));
    }
    const shopData: any = {
          name, bio, address, opening_hours, category,
           sellerId,
        };

      if (website && website.trim().length > 0) {
        shopData.website = website;
      }
      const shop = await prisma.shops.create({
          data: shopData,
        });

        res.status(201).json({
          success: true,
          shop,
        });
    } catch (error) {
      next(error);
  }
};