
import express, { Router } from "express";
import { createShop, createStripeConnectLink, getSeller, 
    getUser, loginSeller, loginUser, logout, refreshToken, 
    registerSeller, resetSellerPassword, resetUserPassword, sellerForgotPassword, 
    stripeWebhook, userForgotPassword, userRegistration, 
    verifySeller, verifySellerForgotPassword, verifyUser, verifyUserForgotPassword } from "../controller/auth.controller";

import { isBuyer, isSeller } from '../../../../packages/middleware/src/authorizeRoles' 
import { isAuthenticated } from "@packages/middleware"
import track_router_kafka, { kafka_batch } from "../controller/track-router-kafka";

const router: Router = express.Router();

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUser); 
router.post("/login-user",loginUser);

// router.post("/admin", admin);

router.post("/refresh-token", refreshToken);
router.get("/logged-in-user", isAuthenticated, isBuyer, getUser);

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

router.post('/track-user-kafka', track_router_kafka);
router.post('/kafka_batch' , kafka_batch)
router.post("/logout", logout);

// router.post(
//   "/webhook/stripe",
//   express.raw({ type: "application/json" }), // ⚠️ Must be raw, not JSON
//   stripeWebhook
// );
export default router;

