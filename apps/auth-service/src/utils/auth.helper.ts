import crypto from "crypto";
import { ValidationError } from "../../../../packages/error-handler/src/AppError";
import redis from "@packages/redis";
import { NextFunction } from "express";
import { sendEmail } from "./sendMail";

export const validateRegistrationData = (data: any, userType: 'user' | "seller") => {
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

export const checkOtpRestrictions = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(email)) {
    return next(
      new ValidationError(
        "Account locked due to multiple failed attempts! Try again after 30 minutes"
      )
    );
  }
  if (await redis.get(`otp_spam_lock:${email}`)){
    return next(
      new ValidationError('Too many OTP Requests ! Please wait a hour')
    )
  }

  if (await redis.get(email)) {
  return next(
    new ValidationError(
      "Please wait 1 minute before requesting a new OTP!"
    )
  );
}

};

export const trackOtpRequests = async (email: string, next:NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;
  let otpRequests = parseInt((await redis.get(otpRequestKey)) || "0" );

  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${email}`,"locked", "EX" , 3600); // Lock for lhol
    throw next(new ValidationError("TOO MANY OTP REQS, Please Wait 1 hour.")
    )
  };
  await redis.set(otpRequestKey, otpRequests + 1, "EX", 36000);
};
  

export const sendOtp = async (name: string, email: string, template: string) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  await sendEmail (email,"Verify Your Email" ,template, {name, otp});

  await redis.set(`otp:${email}`, otp, "EX", 300);
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60)
  return true;
};

export const verifyOtp = async (
  email: string,
  otp: string,
  next: NextFunction
) => {
  const storedOtp = await redis.get(email);

  if (!storedOtp) {
    return next(new ValidationError('Invalid or expired OTP!'));
  }
  const failedAttemptsKey = `${email}:otp:attempts`;

  const failedAttempts = parseInt(
    (await redis.get(failedAttemptsKey)) || '0'
  );

  if (storedOtp !== otp) {
    if (failedAttempts >= 2) {
      await redis.set(`${email}:otp:lock`, 'locked', 'EX', 1800); // Lock for 30 minutes
      await redis.del(`otp:${email}`,failedAttemptsKey);
      return next(
        new ValidationError(
          "Too many failed attempts. Your account is locked for 30 minutes!"
        )
      );

    }
    await redis.set(failedAttemptsKey, failedAttempts + 1, 'EX', 300);
    return next(new ValidationError(`Incorrect OTP. ${2 - failedAttempts} attempts left.`));
  }
    await redis.del(`otp:${email}`, failedAttemptsKey);

};
