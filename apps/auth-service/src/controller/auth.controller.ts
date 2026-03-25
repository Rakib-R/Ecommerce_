
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

    const rememberMe = req.headers['x-remember-me'] === 'true';
    const accessTokenExpiry = rememberMe ? '2d' : '15m'; // Longer if remember me
    const refreshTokenExpiry = rememberMe ? '15' : '7d';

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return next(new AuthError("User doesn't exist!"));
    const isMatch = await bcrypt.compare(password, user.password!);

    if (!isMatch) {
      return next(new ValidationError("Invalid email or password!"));
    }

    //!!!  ------------  WE HAVE TO GET RID OF PREVIOUS TOKENS ------- IT MIGHT BE SELLER OR USER @@ -------------
    res.clearCookie("seller-access-token");
    res.clearCookie("seller-refresh-token");
      
    if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    return next(new AuthError("Internal Server Error: Missing Token Secrets (for user)"));
  }

    const accessToken = jwt.sign(
    { id: user.id, role: "user" },
    process.env.JWT_ACCESS_SECRET as string,
    { expiresIn: accessTokenExpiry }
  );

  // Generate refresh token if needed
    const refreshToken = jwt.sign(
    { id: user.id, role: 'user' },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: refreshTokenExpiry }
  );

    const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  
    // setCookie(res, "refresh_token", refreshToken);
    // setCookie(res, "access_token", accessToken);

    setCookie(res, "refresh_token", refreshToken, {
      maxAge: cookieMaxAge,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
       path: "/",
    });
    
    setCookie(res, "access_token", accessToken, {
      maxAge: cookieMaxAge,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
       path: "/",
    });

    res.status(200).json({ message: "Login successful!", 
      user: { id: user.id, name: user.name, email: user.email } 
    });
  
  } catch (error) {
    return next(error);
    }
};

// Refresh Token - User
export const refreshToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken =  
      req.cookies["refresh_token"] || 
      req.cookies["seller-refresh-token"] ||
      req.headers.authorization?.split(" ")[1];

    console.log('REFRESH TOKEN FOUND:', refreshToken ? 'YES' : 'NO');
    // console.log('COOKIE HEADER:', req.headers.cookie); 

    if (!refreshToken) {
      throw new ValidationError("Unauthorized! No refresh token.");
    }

    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET as string
    ) as {id: string; role: string};
    
    if (!decoded || !decoded.id || !decoded.role) {
    return next(new JsonWebTokenError("Forbidden! Invalid refresh token."));
  }

    let account;

    if (decoded.role === "user") {
      account = await prisma.users.findUnique({ where: { id: decoded.id },  });
  } else if(decoded.role === 'seller'){
      account = await prisma.sellers.findUnique({  where: { id: decoded.id },
      include: {shop: true}
  });
}
    if (!account) return next(new AuthError("Account not found!"));

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role }, 
      process.env.JWT_ACCESS_SECRET as string, 
      { expiresIn: "15m" }
    );
    
    if (decoded.role === "user") {
      setCookie(res, "access_token", newAccessToken);
    } else if (decoded.role === "seller") {
      setCookie(res, "seller-access-token", newAccessToken);
    }
      
    req.role = decoded.role;

    return res.status(201).json({ success: true }); 
    } catch (error) { 
     return next(error); 
    }
};
  export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user
    res.status(201).json({ success: true , user});
  } catch (error) {
    next(error);
  }
}

export const userForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  await  handleForgotPassword(req, res, next, "buyer");
};

// Verify forgot password OTP for User !
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
  apiVersion: "2026-02-25.clover", // Use the stable version provided in your Stripe dashboard
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
       return next(new ValidationError('Seller already exists with this email!'))
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
      return next (new ValidationError('All fields are required for creating shop!'));
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
      
    console.log("Stripe Key Loaded:", process.env.STRIPE_SECRET_KEY?.substring(0, 8) + "...");
    if (!sellerId) {
      return next(new Error("Seller ID is required!"));
    }

    // 1. Find seller in DB
    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
    });

    if (!seller) {
      return next(new Error("Seller account not found."));
    }

    let stripeAccountId = seller.stripeId;

    // 2. ✅ Only create a NEW Stripe account if seller doesn't have one yet
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: seller.email,
        country: "GB",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
      });

      stripeAccountId = account.id;

      // 3. ✅ Save stripeId immediately after creation
      await prisma.sellers.update({
        where: { id: sellerId },
        data: { stripeId: stripeAccountId },
      });
    }

    // 4. ✅ Check if this account has already completed onboarding
    const account = await stripe.accounts.retrieve(stripeAccountId);

    if (account.details_submitted) {
      return res.status(200).json({
        url: null,
        message: "Stripe account already fully onboarded.",
        alreadyOnboarded: true,
      });
    }

    // 5. ✅ Create the onboarding link using saved/existing account ID
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      return_url: `${process.env.SELLER_APP_URL}/seller/connect/return`,   // ✅ Use env var
      refresh_url: `${process.env.SELLER_APP_URL}/seller/connect/refresh`,
      type: "account_onboarding",
    });

    return res.status(200).json({ url: accountLink.url });

  } catch (error: any) {
    
    if (error?.type?.startsWith("Stripe")) {
      console.error("Stripe Error:", error.message);
      return next(new Error(`Stripe error: ${error.message}`));
    }
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

    const rememberMe = req.headers['x-remember-me'] === 'true';
    const accessTokenExpiry = rememberMe ? '2d' : '15m'; // Longer if remember me
    const refreshTokenExpiry = rememberMe ? '15' : '7d';

    const seller = await prisma.sellers.findUnique({ where: { email } });
    if (!seller) return next(new AuthError("Seller doesn't exist!"));
    const isMatch = await bcrypt.compare(password, seller.password!);

    if (!isMatch) {
      return next(new ValidationError("Invalid email or password!"));
    }

    const cookieMaxAge = rememberMe ? 15 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000; // 30 days vs 7 days

    // Clear any existing buyer tokens so sessions don't conflict
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    
    if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    return next(new AuthError("Internal Server Error: Missing Token Secrets (for seller)"));
    }
      const accessToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: accessTokenExpiry }
    );

    // Generate refresh token if needed
      const refreshToken = jwt.sign(
     { id: seller.id, role: "seller" },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: refreshTokenExpiry }
    );
    //!  USE THIS IF YOU HAVE BUYER ACCOUNT AND WANT TO AUTOMATICALLY SWITCH 
    // ! BETWEEN TWO ACCOUNT BECAUSE THIS COOKIE NAME SAME AS BUYER ONE

    // setCookie(res, "refreshToken", refreshToken);
    // setCookie(res, "accessToken", accessToken);
    // SHORT CUT 
    // setCookie(res, "seller-refresh-token", refreshToken);
    // setCookie(res, "seller-access-token", accessToken);

    // --------------- ~ LONG CUT ~  ----------------------
    //! OPTIONAL FOR FULLY FUNCTIONAL REMEMBER-ME!
    setCookie(res, "seller-refresh-token", refreshToken, {
      maxAge: cookieMaxAge,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
       path: "/",
    });
    
    setCookie(res, "seller-access-token", accessToken, {
      maxAge: cookieMaxAge,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
       path: "/",
    });

    res.status(200).json({ message: "Login successful!", 
      seller: { id: seller.id, name: seller.name, email: seller.email } 
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

  if (!req.user || req.user.role !== 'seller') {
    return res.status(403).json({ success: false, message: "Forbidden: Not a seller" });
  }
  try {
    const seller = req.seller; // assuming `req.seller` is set by auth middleware

    res.status(200).json({
      success: true,
      seller: seller,
    });

  } catch (error) {
    next(error);
  }
};

// Stripe webhook — fires when seller completes onboarding
export const stripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // ⚠️ Must use raw body — see Step 4
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return res.status(400).json({ message: "Webhook signature failed" });
  }

  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;

    // Only update if fully onboarded
    if (account.details_submitted && account.charges_enabled) {
      await prisma.sellers.updateMany({
        where: { stripeId: account.id },
        data: { stripeOnboarded: true },
      });
    }
  }

  res.json({ received: true });
};

export const sellerForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  await  handleForgotPassword(req, res, next, "seller");
};

// Verify forgot password OTP For Seller !
export const verifySellerForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => await verifyForgotPasswordOtp(req, res, next);

export const resetSellerPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      throw new ValidationError("Email and new password are required!");

    const seller = await prisma.sellers.findUnique({ where: { email } });
    if (!seller) return next(new ValidationError("Seller not found!"));

    // compare new password with the existing one
    const isSamePassword = await bcrypt.compare(newPassword, seller.password!);
    if (isSamePassword)
      throw new ValidationError("New password cannot be the same as the old password!");
    
    // hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.sellers.update({
        where: { email },
        data: { password: hashedPassword },
      });
      
    res.status(200).json({ message: "Password reset successfully!" });

  } catch (error) {
    return next(error);
  }
};


export const logout = (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    // Clear all role-based tokens
    res.clearCookie("access_token",          cookieOptions);
    res.clearCookie("refresh_token",         cookieOptions);
    res.clearCookie("seller-access-token",   cookieOptions);
    res.clearCookie("seller-refresh-token",  cookieOptions);
    res.clearCookie("admin-access-token",    cookieOptions);
    res.clearCookie("admin-refresh-token",   cookieOptions);

    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    next(error);
  }
};
