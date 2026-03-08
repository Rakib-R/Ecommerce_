
import express, { Router } from "express";
import { createShop, createStripeConnectLink, getSeller, getUser, loginSeller, loginUser, refreshToken, registerSeller, resetSellerPassword, resetUserPassword, sellerForgotPassword, stripeWebhook, userForgotPassword, userRegistration, verifySeller, verifySellerForgotPassword, verifyUser, verifyUserForgotPassword } from "../controller/auth.controller";
import { isSeller } from '../../../../packages/middleware/src/authorizeRoles' 
import {isAuthenticated} from "@packages/middleware"

const router: Router = express.Router();

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUser); 
router.post("/login-user", loginUser);
router.post("/refresh-token", refreshToken);
router.get("/logged-in-user" ,isAuthenticated, getUser);

router.post("/forgot-password-buyer", userForgotPassword);
router.post("/reset-user-password", resetUserPassword);
router.post("/verify-forgot-password-buyer", verifyUserForgotPassword);

///  ----------     SELLER ----------

router.post("/seller-registration", registerSeller);
router.post("/verify-seller", verifySeller);
router.post("/create-shop", createShop);
router.post("/create-stripe-link", createStripeConnectLink);

router.post("/forgot-password-seller", sellerForgotPassword);
router.post("/reset-seller-password", resetSellerPassword);
router.post("/verify-forgot-password-seller", verifySellerForgotPassword);

router.post("/login-seller", loginSeller);
router.get("/logged-in-seller", isAuthenticated, isSeller, getSeller);

// router.post(
//   "/webhook/stripe",
//   express.raw({ type: "application/json" }), // ⚠️ Must be raw, not JSON
//   stripeWebhook
// );
export default router;

