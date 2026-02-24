
import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, handleForgotPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyForgotPasswordOtp, verifyOtp } from "../utils/auth.helper";
import { AppError, AuthError, ValidationError } from "@packages/error-handler";
import prisma from "@packages/prisma";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken"
import { setCookie } from "../utils/cookies/setCookie";
import Stripe from 'stripe';


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
    await sendOtp (name,email, 'verify-email');

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

//TODO  -------------------   S E  L L  E  R  S LOGIC  ! !  !    REGISTER NEW SELLER  REGISTER NEW SELLER


if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-01-28.clover", // Use the stable version provided in your Stripe dashboard
  typescript: true, // Optional: enables better type support if you are using TS
});

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
    await sendOtp(name, email, 'verify-email');
     res.status(200).json({
        message: "OTP sent to email. Please verify your account."
      });
    } catch (error) {
      next(error);
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

    await verifyOtp(email, otp, next);

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

// create stripe connect account link
export const createStripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;

  //  Basic validation: check if ID exists in request
  if (!sellerId) {
    return next(new Error("Seller ID is required!"));
  }

  //  Database check: find the seller in Prisma
  const seller = await prisma.sellers.findUnique({
    where: {
      id: sellerId,
    },
  });

  if (!seller) {
    return next(new Error("Seller account is not available or does not exist."));
  }
    const account = await stripe.accounts.create({
    type: "express",
    email: seller.email, // Ensure this variable matches your seller object
    country: "GB",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
  },
  business_type: "individual", 
});

  await prisma.sellers.update({ where: { id: sellerId, },
    data: {
    stripeId: account.id, },
  })

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: "http://localhost:4000/success", // Use refresh_url
    return_url: "http://localhost:4000/success",  // Use return_url
    type: "account_onboarding",                   // Fixed spelling of 'onboarding'
});

  res.status(200).json({  url: accountLink.url });

  } catch (error) {
    return next(error);
  }
};


export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError("Email and password are required!"));
    }

    const seller = await prisma.sellers.findUnique({ where: { email } });
    if (!seller) return next(new AuthError("Seller doesn't exist!"));
    const isMatch = await bcrypt.compare(password, seller.password!);

      if (!isMatch) {
        return next(new ValidationError("Invalid email or password!"));
      }

      if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
      return next(new AuthError("Internal Server Error: Missing Token Secrets"));
    }
      const accessToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: "15m" }
    );

    // Generate refresh token if needed
      const refreshToken = jwt.sign(
      { id: seller.id },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: "7d" }
    );
    //!  USE THIS IF YOU HAVE BUYER ACCOUNT AND WANT TO AUTOMATICALLY SWITCH 
    // ! BETWEEN TWO ACCOUNT BECAUSE THIS COOKIE NAME SAME AS BUYER ONE

    // setCookie(res, "refreshToken", refreshToken);
    // setCookie(res, "accessToken", accessToken);
    
    setCookie(res, "seller-refresh-token", refreshToken);
    setCookie(res, "setter-access-token", accessToken);

    res.status(200).json({ message: "Login successful!", 
      user: { id: seller.id, name: seller.name, email: seller.email } 
    });
  
  } catch (error) {
    return next(error);
    }
};

// Get logged-in seller

export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller; // assuming `req.seller` is set by auth middleware

    res.status(200).json({
      success: true,
      setter: seller,
    });
  } catch (error) {
    next(error);
  }
};