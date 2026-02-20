
import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, handleForgotPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyForgotPasswordOtp, verifyOtp } from "../utils/auth.helper";
import { AppError, AuthError, ValidationError } from "@packages/error-handler";
import prisma from "@packages/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { setCookie } from "../utils/cookies/setCookie";


export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "user");
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
     throw new Error('Fields are required!');
    }
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User already exists with this email!');
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

    const accessToken = jwt.sign(
    { id: user.id, role: "user" },
    process.env.JWT_SECRET as string,
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

export const userForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  await  handleForgotPassword(req, res, next, "user");
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
      return next(new ValidationError("Email and new password are required!"));

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return next(new ValidationError("User not found!"));

    // compare new password with the existing one
    const isSamePassword = await bcrypt.compare(newPassword, user.password!);
    if (isSamePassword)
      return next(new ValidationError("New password cannot be the same as the old password!"));
    
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
