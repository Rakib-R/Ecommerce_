
import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, sendOtp, trackOtpRequests, validateRegistrationData, verifyOtp } from "../utils/auth.helper";
import { AppError } from "@packages/error-handler";
import prisma from "@packages/prisma";
import bcrypt from "bcryptjs";


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
      return next(new AppError("User already exists with this email!", 400));
    }

    await checkOtpRestrictions(email, next);
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
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, name, password } = req.body;

    if (!email || !password || !otp || !name) {
        return next(new Error('Fields are required!'));
      }
      const existingUser = await prisma.users.findUnique({
        where: { email },
      });

      if (existingUser) {
        return next(new Error('User already exists with this email!'));
      }
      await verifyOtp(email, otp,next);
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.users.create(
        { data: { name, email, password: hashedPassword } });

    // TODO: verify OTP logic here
    return res.status(200).json({
      message: 'User verified successfully',
    });

  } catch (error) {
    return next(error);
  }
};
