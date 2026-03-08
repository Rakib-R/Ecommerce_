import crypto from "crypto";
import { AuthError, ValidationError } from "../../../../packages/error-handler/src/AppError";
import redis from "@packages/redis";
import { NextFunction, Request, Response } from "express";
import { sendEmail } from "./sendMail";
import prisma from "@packages/prisma";

export const validateRegistrationData = (data: any, userType: 'buyer' | "seller") => {
  const {
    name,
    email,
    password,
    phone_number,country,
  } = data;

    if (!name || !email || !password || (userType === "seller" && (!phone_number || !country))) {
      throw new ValidationError("Missing required fields!");
    }
    const trimmedEmail = email.trim(); // <-- trim whitespace

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      throw new ValidationError("Invalid email format!");
  }
};

export const checkOtpRestrictions = async (email: string, next: NextFunction) => {
  // Check specifically for the lock key
  const isLocked = await redis.get(`${email}:otp:lock`);
  if (isLocked) {
    throw new ValidationError("Account locked! Try again after 30 minutes");
  }

  // Check specifically for the spam lock
  const isSpamLocked = await redis.get(`otp_spam_lock:${email}`);
  if (isSpamLocked) {
    throw new ValidationError('Too many OTP Requests! Please wait an hour');
  }

  // Check for the 1-minute cooldown
  const isCooldowned = await redis.get(`otp_cooldown:${email}`);
  if (isCooldowned) {
    throw new ValidationError("Please wait 1 minute before requesting a new OTP!");
  }
};

export const trackOtpRequests = async (email: string, next:NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;
  let otpRequests = parseInt((await redis.get(otpRequestKey)) || "0" );

  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${email}`,"locked", "EX" , 3600); // Lock for lhol
    throw new ValidationError("Too Many OTP Requests, Please Wait 1 Hour.")
    
  };
  await redis.set(otpRequestKey, otpRequests + 1, "EX", 36000);
};
  

export const sendOtp = async (name: string, email: string, template: string) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  await sendEmail (email,"verify-email" ,template, {name, otp});

  await redis.set(`otp:${email}`, otp, "EX", 300);
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60)
  return true;
};

export const verifyOtp = async (
email: string, otp: string, next: NextFunction
) => {
  
  const storedOtp = await redis.get(`otp:${email}`); // <-- FIXED
  if (!storedOtp) {
    console.log("😍😜storedOtp storedOtp storedOtp 😍👌👌❤😜",storedOtp)
    throw new ValidationError('Invalid or expired OTP!');
  }
  const failedAttemptsKey = `${email}:otp:attempts`;

  const failedAttempts = parseInt(
    (await redis.get(failedAttemptsKey)) || '0'
  );

  if (storedOtp !== otp) {
    if (failedAttempts >= 2) {
      await redis.set(`${email}:otp:lock`, 'locked', 'EX', 1800); // Lock for 30 minutes
      await redis.del(`otp:${email}`,failedAttemptsKey);
      throw new ValidationError(
          "Too many failed attempts. Your account is locked for 30 minutes!"
        );
    }
    await redis.set(failedAttemptsKey, failedAttempts + 1, 'EX', 300);
    throw new ValidationError(`Incorrect OTP. ${2 - failedAttempts} attempts left.`);
  }
    await redis.del(`otp:${email}`, failedAttemptsKey);
};

export const handleForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
  userType: "buyer" | "seller"
) => {
    try {
      const { email } = req.body;
      if (!email) throw new ValidationError("Email is required!");

      // Find user in DB
      const user = userType === "buyer" ? 
      await prisma.users.findUnique({ where: { email } })
      : await prisma.sellers.findUnique({ where: { email } });
      
      if (!user) throw new ValidationError(`${userType} not found!`);

      // Check OTP restrictions
      await checkOtpRestrictions(email, next);
      await trackOtpRequests(email, next);

      // Generate OTP and send Email
      await sendOtp(user.name, email, userType === 'buyer' 
        ? "forgot-password-buyer" 
        : "forgot-password-seller");
      res.status(200).json({ message: "OTP sent to email. Please verify your account!" });

    } catch (error) {
      return next(error);
  }
};

  export const verifyForgotPasswordOtp = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) throw new ValidationError("Email and OTP are required!");
      await verifyOtp(email, otp, next); // Assuming verifyOtp handles OTP verification

      res.status(200).json({ message: "OTP verified successfully! You may reset ur password" });
    } catch (error) {
      return next(error);
    }
  };

