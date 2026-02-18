import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, sendOtp, trackOtpRequests, validateRegistrationData } from "../utils/auth.helper";
import { AppError } from "../../../../packages/error-handler";
import prisma from "../../../../packages/libs/prisma";

// Register a new user
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try{

     validateRegistrationData(req.body, "user");
  const { name, email } = req.body;

  const existingUser = await prisma.users.findUnique({
      where: { email },
  });

  if (existingUser) {
    throw next(new AppError("User already exists with this email!", 400));
  }

  await checkOtpRestrictions(email, next);
  await trackOtpRequests(email, next);
  await sendOtp(email, name, 'user-activation-mail');

  res.status(200).json({
    message: "OTP sent to email. Pls verify"
  })
 
  }

  catch(error) {
      return error
  }
};
