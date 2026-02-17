import crypto from "crypto";
import { ValidationError } from "../../../../packages/error-handler";
import redis from "../../../../packages/libs/redis"
import { NextFunction } from "express";
import { sendEmail } from "./sendMail";
import { RedisKey } from "ioredis";

const emailRegex = /^[^\s@]+@[^\s+\.[^\s@]+$/;

export const validateRegistrationData = (data: any, userType: 'user' | "seller") => {
  const {
    name,
    email,
    password,
    phone_number,country,
  } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === "seller" && (!phone_number || !country))
  ) {
    return new ValidationError("Missing required fields!");
  }

  if (!emailRegex.test(email)) {
  return new ValidationError("Invalid email format!");
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
    return next(new ValidationError("TOO MANY OTP REQS, Please Wait 1 hour.")
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

