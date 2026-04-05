
// middleware/requireStripeOnboarded.ts
import { Response, NextFunction } from "express";
import prisma from "@packages/prisma";
import { AuthError } from "@packages/error-handler";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export const requireStripeOnboarded = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller; // already set by your existing auth middleware

    if (!seller) {
      return next(new AuthError("Unauthorized!"));
    }

    //  Quick DB check first (avoids hitting Stripe API every time)
    const dbSeller = await prisma.sellers.findUnique({
      where: { id: seller.id },
    });

    if (!dbSeller?.stripeId) {
      return res.status(403).json({
        success: false,
        code: "STRIPE_NOT_CONNECTED",
        message: "You must connect a Stripe account before accessing this feature.",
      });
    }

    //  If DB says onboarded, skip Stripe API call entirely
    if (dbSeller.stripeOnboarded) {
      return next();
    }

    //  Double-check with Stripe (in case webhook hasn't fired yet)
    const stripeAccount = await stripe.accounts.retrieve(dbSeller.stripeId);

    if (!stripeAccount.details_submitted) {
      return res.status(403).json({
        success: false,
        code: "STRIPE_ONBOARDING_INCOMPLETE",
        message: "Please complete your Stripe onboarding before continuing.",
      });
    }

    if (!stripeAccount.charges_enabled) {
      return res.status(403).json({
        success: false,
        code: "STRIPE_CHARGES_DISABLED",
        message: "Your Stripe account is still under review.",
      });
    }

    // ✅ Sync to DB so future requests skip the Stripe API call
    await prisma.sellers.update({
      where: { id: dbSeller.id },
      data: { stripeOnboarded: true },
    });

    next();
  } catch (error) {
    next(error);
  }
};