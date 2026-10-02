// import { NextFunction, Request, Response } from 'express';
// import {
//   checkOtpRestrictions,
//   handleForgotPassword,
//   sendOtp,
//   trackOtpRequests,
//   validateRegistrationData,
//   verifyForgotPasswordOtp,
//   verifyOtp,
// } from '../utils/auth.helper';
// import { AppError, AuthError, ValidationError } from '@packages/error-handler';
// import { withRetry, prisma } from '@packages/prisma';
// import bcrypt from 'bcryptjs';
// import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
// import { setCookie } from '../utils/cookies/setCookie';
// import Stripe from 'stripe';

// export const userRegistration = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     validateRegistrationData(req.body, 'buyer');
//     const { name, email } = req.body;

//     const existingUser = await withRetry(() =>
//       prisma.users.findUnique({
//         where: { email },
//       })
//     );

//     if (existingUser) {
//       // Use 'return next' to exit the function immediately
//       throw new AppError('User already exists with this email!', 400);
//     }

//     await checkOtpRestrictions(email, next);
//     await trackOtpRequests(email, next);
//     await sendOtp(name, email, 'verify-email');

//     res.status(200).json({
//       message: 'OTP sent to email. Pls verify',
//     });
//   } catch (error) {
//     // Pass the actual error object to your error middleware
//     next(error);
//   }
// };

// // verify user with OTP
// export const verifyUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { email, otp, name, password } = req.body;

//     if (!email || !password || !otp || !name) {
//       throw new AppError('Fields are required!', 400);
//     }
//     const existingUser = await prisma.users.findUnique({
//       where: { email },
//     });

//     if (existingUser) {
//       throw new AppError('Buyer/ User already exists with this email!', 409);
//     }
//     await verifyOtp(email, otp, next);

//     const hashedPassword = await bcrypt.hash(password, 10);

//     await prisma.users.create({
//       data: { name, email, password: hashedPassword },
//     });

//     res.status(201).json({
//       success: true,
//       message: 'User registered Successfully',
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// export const loginUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return next(new ValidationError('Email and password are required!'));
//     }

//     const rememberMe = req.headers['x-remember-me'] === 'true';
//     const accessTokenExpiry = rememberMe ? '2d' : '15m'; // Longer if remember me
//     const refreshTokenExpiry = rememberMe ? '15d' : '7d';

//     const user = await withRetry(() =>
//       prisma.users.findUnique({ where: { email } })
//     );
//     if (!user) return next(new AuthError("User doesn't exist!"));
//     const isMatch = await bcrypt.compare(password, user.password!);

//     if (!isMatch) {
//       return next(new ValidationError('Invalid email or password!'));
//     }

//     //!!!  ---------  HAVE TO GET RID OF PREVIOUS TOKENS ------- MIGHT BE SELLER OR USER @@ -------------

//     res.clearCookie('seller_refresh_token', { path: '/' });
//     res.clearCookie('seller_refresh_token', { path: '/' });

//     if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
//       return next(
//         new AuthError('Internal Server Error: Missing Token Secrets (for user)')
//       );
//     }
//     const accessToken = jwt.sign(
//       { id: user.id, role: 'user' },
//       process.env.JWT_ACCESS_SECRET as string,
//       { expiresIn: accessTokenExpiry }
//     );

//     // Generate refresh token if needed
//     const refreshToken = jwt.sign(
//       { id: user.id, role: 'user' },
//       process.env.JWT_REFRESH_SECRET as string,
//       { expiresIn: refreshTokenExpiry }
//     );

//     const accessCookieMaxAge = rememberMe
//       ? 2 * 24 * 60 * 60 * 1000 // 2 days in ms
//       : 15 * 60 * 1000; // 15 minutes in ms

//     const refreshCookieMaxAge = rememberMe
//       ? 15 * 24 * 60 * 60 * 1000 // 15 days in ms
//       : 7 * 24 * 60 * 60 * 1000;

//     setCookie(res, 'refresh_token', refreshToken, {
//       maxAge: refreshCookieMaxAge,
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       path: '/',
//     });

//     setCookie(res, 'access_token', accessToken, {
//       maxAge: accessCookieMaxAge,
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       path: '/',
//     });

//     res
//       .status(200)
//       .json({
//         message: 'Login successful!',
//         user: { id: user.id, name: user.name, email: user.email },
//       });
//   } catch (error) {
//     return next(error);
//   }
// };
// // export const admin = async (

// //   req: Request,
// //   res: Response,
// //   next: NextFunction
// // ) => {
// //   try {
// //     const { email, password } = req.body;
// //     // --- ADMIN BYPASS START ---
// //     let verified_admin;

// //     verified_admin =
// //       await prisma.users.findUnique({where : { email } }) ||
// //       await prisma.sellers.findUnique({where : { email } })

// //     if (email === "admin@email.com" && password === "admin") {
// //       const adminPayload = { id: verified_admin?.id, role: "admin" };

// //       const accessToken = jwt.sign(
// //         adminPayload,
// //         process.env.JWT_ACCESS_SECRET!,
// //         { expiresIn: '2d' }
// //       );

// //       const refreshToken = jwt.sign(
// //         adminPayload,
// //         process.env.JWT_REFRESH_SECRET!,
// //         { expiresIn: '7d' }
// //       );

// //       setCookie(res, "admin_access_token", accessToken);
// //       setCookie(res, "admin_refresh_token", refreshToken);

// //       return res.status(200).json({
// //         message: "Admin Login successful!",
// //         admin: { id: "admin-0042", name: "System Admin", email: "admin@system.com" }
// //       });
// //     }
// //     // --- ADMIN BYPASS END ---
// //     return next();

// //   } catch (error) {
// //     console.log(error)
// //     next(error);
// //   }
// // }

// // Refresh Token - User

// export const refreshToken_User = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const refreshToken =
//       req.cookies['refresh_token'] || req.headers.authorization?.split(' ')[1];

//     console.log('REFRESH_TOKEN FOUND ( USER) :', refreshToken ? 'YES' : 'NO');
//     // console.log('COOKIE HEADER:', req.headers.cookie);

//     if (!refreshToken) {
//       throw new ValidationError('Unauthorized! No refresh token.');
//     }

//     // ✅ Decode without verifying first — to check expiry gracefully
//     interface JwtPayload {
//       id: string;
//       role: 'user';
//     }

//     let decoded: JwtPayload;
//     try {
//       decoded = jwt.verify(
//         refreshToken,
//         process.env.JWT_REFRESH_SECRET!
//       ) as JwtPayload;
//     } catch (err) {
//       if (err instanceof TokenExpiredError) {
//         //  Refresh token expired → clear cookies → force re-login
//         res.clearCookie('refresh_token', { path: '/' });
//         res.clearCookie('access_token', { path: '/' });
//         return res.status(401).json({
//           success: false,
//           message: 'Session expired For User. Please log in again.',
//         });
//       }

//       return res.status(401).json({
//         success: false,
//         message: 'Invalid refresh token (User).',
//       });
//     }

//     if (!decoded || !decoded.id || !decoded.role) {
//       return next(new JsonWebTokenError('Forbidden! Invalid refresh token.'));
//     }

//     let account;

//     if (decoded.role === 'user') {
//       account = await prisma.users.findUnique({ where: { id: decoded.id } });
//     }
//     req.user = account;

//     if (decoded.role !== 'user') {
//       return res.status(403).json({
//         success: false,
//         message: 'Forbidden: Invalid role for user endpoint',
//       });
//     }
//     if (!account) return next(new AuthError('Account not found!'));

//     const newAccessToken = jwt.sign(
//       { id: decoded.id, role: decoded.role },
//       process.env.JWT_ACCESS_SECRET as string,
//       { expiresIn: '15m' }
//     );

//     if (decoded.role === 'user') {
//       setCookie(res, 'access_token', newAccessToken);
//     }

//     req.role = decoded.role;
//     return res.status(200).json({
//       success: true,
//       role: req.role,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// export const refreshToken_Seller = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const refreshToken =
//       req.cookies['seller_refresh_token'] ||
//       req.headers.authorization?.split(' ')[1];

//     console.log('REFRESH_TOKEN FOUND foR SELLER:', refreshToken ? 'YES' : 'NO');
//     // console.log('COOKIE HEADER:', req.headers.cookie);

//     if (!refreshToken) {
//       throw new ValidationError('Unauthorized! No refresh token (Seller).');
//     }

//     //  Decode without verifying first — to check expiry gracefully
//     interface JwtPayload {
//       id: string;
//       role: 'seller' | 'admin';
//     }

//     let decoded: JwtPayload;
//     try {
//       decoded = jwt.verify(
//         refreshToken,
//         process.env.JWT_REFRESH_SECRET!
//       ) as JwtPayload;
//     } catch (err) {
//       if (err instanceof TokenExpiredError) {
//         // ✅ FIX 2: Explicitly pass path configuration when clearing cookies
//         res.clearCookie('refresh_token', { path: '/' });
//         res.clearCookie('access_token', { path: '/' });
//         return res.status(401).json({
//           success: false,
//           message: 'Session expired (Seller). Please log in again.',
//         });
//       }

//       return res.status(401).json({
//         success: false,
//         message: 'Invalid refresh token (Seller ).',
//       });
//     }

//     if (!decoded || !decoded.id || !decoded.role) {
//       return next(new JsonWebTokenError('Forbidden! Invalid refresh token.'));
//     }

//     let account;

//     if (decoded.role === 'seller') {
//       account = await prisma.sellers.findUnique({ where: { id: decoded.id } });
//     }
//     req.seller = account;

//     if (decoded.role !== 'seller') {
//       return res.status(403).json({
//         success: false,
//         message: 'Forbidden: Invalid role for user endpoint',
//       });
//     }
//     if (!account) return next(new AuthError('Account not found! (Seller)'));

//     const newAccessToken = jwt.sign(
//       { id: decoded.id, role: decoded.role },
//       process.env.JWT_ACCESS_SECRET as string,
//       { expiresIn: '15m' }
//     );

//     if (decoded.role === 'seller') {
//       setCookie(res, 'seller_refresh_token', newAccessToken);
//     }

//     req.role = decoded.role;
//     return res.status(200).json({
//       success: true,
//       role: req.role,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// export const getUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const user = req.user || req.admin;

//     // 1. If user exists, always return the user data
//     if (user) {
//       return res.status(200).json({ success: true, user });
//     }

//     // 2. If no user, check if the path allows public access
//     if (req.path === '/' || req.path === '/home') {
//       return res.status(200).json({
//         success: true,
//         message: 'Public access granted',
//         user: null,
//       });
//     }

//     // 3. No user and not a public path means forbidden
//     return res.status(403).json({
//       success: false,
//       message: 'Does Not Exist: Not a User or Admin',
//     });
//   } catch (error: unknown) {
//     next(error); // Pass TypeScript safe error handling to Express
//   }
// };

// export const userForgotPassword = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   await handleForgotPassword(req, res, next, 'buyer');
// };

// // Verify forgot password OTP for User !
// export const verifyUserForgotPassword = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => await verifyForgotPasswordOtp(req, res, next);

// export const resetUserPassword = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { email, newPassword } = req.body;
//     if (!email || !newPassword)
//       throw new ValidationError('Email and new password are required!');

//     const user = await prisma.users.findUnique({ where: { email } });
//     if (!user) return next(new ValidationError('User not found!'));

//     // compare new password with the existing one
//     const isSamePassword = await bcrypt.compare(newPassword, user.password);
//     if (isSamePassword)
//       throw new ValidationError(
//         'New password cannot be the same as the old password!'
//       );

//     // hash the new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     await prisma.users.update({
//       where: { email },
//       data: { password: hashedPassword },
//     });

//     res.status(200).json({ message: 'Password reset successfully!' });
//   } catch (error) {
//     return next(error);
//   }
// };

// import { addressType } from '@prisma/client';
// export const addUserAddress = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const userId = req.user?.id;
//     if (!userId) {
//       return next(new Error('User not authenticated'));
//     }

//     const enumMap: Record<string, addressType> = {
//       Home: addressType.HOME, // Use Prisma enum, not string
//       Work: addressType.WORK,
//       Other: addressType.OTHER,
//     };

//     const { label, name, street, city, zip, country, isDefault } = req.body;

//     // Validation
//     if (!label || !name || !street || !city || !zip || !country) {
//       return next(new Error('All fields are required'));
//     }

//     // If this address is set as default, update all other addresses to non-default
//     if (isDefault) {
//       await prisma.address.updateMany({
//         where: {
//           userId: userId,
//           isDefault: true,
//         },
//         data: {
//           isDefault: false,
//         },
//       });
//     }

//     // Create new address
//     const newAddress = await prisma.address.create({
//       data: {
//         userId: userId,
//         label: enumMap[label as keyof typeof enumMap],
//         name,
//         street,
//         city,
//         zip,
//         country,
//         isDefault: isDefault || false,
//       },
//     });

//     res.status(201).json({
//       success: true,
//       address: newAddress,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// export const deleteUserAddress = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const userId = req?.user?.id;
//     const { addressId } = req.params;

//     if (!addressId) {
//       return next(new Error('Address ID is required'));
//     }

//     // Check if address exists and belongs to user
//     const existingAddress = await prisma.address.findFirst({
//       where: {
//         id: addressId,
//         userId: userId,
//       },
//     });

//     if (!existingAddress) {
//       return next(new Error('Address not found or unauthorized'));
//     }

//     // Delete the address
//     await prisma.address.delete({
//       where: {
//         id: addressId,
//       },
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Address deleted successfully',
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// export const getUserAddresses = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const userId = req?.user?.id;

//     const addresses = await prisma.address.findMany({
//       where: { userId },
//       orderBy: { createdAt: 'desc' },
//     });

//     res.json({
//       success: true,
//       addresses,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// //todo -----------------   S E  L  L  E  R  S  =======  L O G I C  ! !  !   REGISTER NEW SELLER   -----------------
// //todo                            REGISTER NEW SELLER

// if (!process.env.STRIPE_SECRET_KEY) {
//   throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
// }

// export const registerSeller = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     // Validate incoming data
//     validateRegistrationData(req.body, 'seller');
//     const { name, email } = req.body;

//     const existingSeller = await prisma.sellers.findUnique({
//       where: { email },
//     });

//     if (existingSeller) {
//       throw new ValidationError('Seller already exists with this email!');
//     }

//     await checkOtpRestrictions(email, next);
//     await trackOtpRequests(email, next);
//     await sendOtp(name, email, 'verify-email');
//     res.status(200).json({
//       message: 'OTP sent to email. Please verify your account.',
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // verify seller with OTP
// export const verifySeller = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { email, otp, password, name, phone_number, country, avatarData } =
//       req.body;

//     if (!email || !otp || !password || !name || !phone_number || !country) {
//       return next(new ValidationError('All fields are required'));
//     }

//     const existingSeller = await prisma.sellers.findUnique({
//       where: { email },
//     });
//     if (existingSeller) {
//       return next(
//         new ValidationError('Seller already exists with this email!')
//       );
//     }

//     await verifyOtp(email, otp, next);

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const seller = await prisma.sellers.create({
//       data: {
//         name,
//         email,
//         password: hashedPassword,
//         country,
//         phone_number,
//         avatar: avatarData
//           ? {
//               create: {
//                 file_id: avatarData.file_id,
//                 file_url: avatarData.file_url,
//               },
//             }
//           : undefined,
//       },
//     });
//     res.status(201).json({
//       seller,
//       message: 'Seller registered successfully!',
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Create shop
// import { ShopType } from 'packages/utils/src/global';
// // 1. Force the input type to accept the Prisma relation block, ignoring the global interface structure
// type CreateShopInput = Omit<ShopType, 'id' | 'seller' | 'coverShop'> & {
//   coverShop?: {
//     create: {
//       file_id: string;
//       url: string;
//     };
//   };
// };

// export const createShop = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const {
//       name,
//       bio,
//       address,
//       opening_hours,
//       website,
//       category,
//       sellerId,
//       avatarData,
//     } = req.body;

//     if (!name || !bio || !address || !sellerId || !opening_hours || !category) {
//       return next(
//         new ValidationError('All fields are required for creating shop!')
//       );
//     }

//     // 2. Remove the trailing ', seller' field from this object literal block
//     const shopData: CreateShopInput = {
//       name,
//       bio,
//       address,
//       opening_hours,
//       category,
//       sellerId,
//     };

//     if (website && website.trim().length > 0) {
//       shopData.website = website;
//     }

//     if (avatarData) {
//       // 3. This will now compile cleanly because we overrode 'coverShop' above
//       shopData.coverShop = {
//         create: {
//           file_id: avatarData.file_id,
//           url: avatarData.file_url,
//         },
//       };
//     }

//     // 4. Cast to any here to satisfy Prisma's complex dynamic type checker
//     const shop = await prisma.shops.create({
//       data: shopData as any,
//     });

//     await prisma.sellers.update({
//       where: { id: sellerId },
//       data: { shop: { connect: { id: shop.id } } },
//     });

//     return res.status(201).json({
//       success: true,
//       shop,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// // create stripe connect account link
// export const createStripeConnectLink = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { sellerId } = req.body;

//     console.log(
//       'Stripe Key Loaded:',
//       process.env.STRIPE_SECRET_KEY?.substring(0, 8) + '...'
//     );
//     if (!sellerId) {
//       return next(new Error('Seller ID is required!'));
//     }

//     // 1. Find seller in DB
//     const seller = await prisma.sellers.findUnique({
//       where: { id: sellerId },
//     });

//     if (!seller) {
//       return next(new Error('Does Not Exist: Not a sellr or admin'));
//     }

//     let stripeAccountId = seller.stripeId;

//     // 2. ✅ Only create a NEW Stripe account if seller doesn't have one yet
//     if (!stripeAccountId) {
//       const account = await stripe.accounts.create({
//         type: 'express',
//         email: seller.email,
//         country: 'GB',
//         capabilities: {
//           card_payments: { requested: true },
//           transfers: { requested: true },
//         },
//         business_type: 'individual',
//       });

//       stripeAccountId = account.id;

//       // 3. ✅ Save stripeId immediately after creation
//       await prisma.sellers.update({
//         where: { id: sellerId },
//         data: { stripeId: stripeAccountId },
//       });
//     }

//     // 4. ✅ Check if this account has already completed onboarding
//     const account = await stripe.accounts.retrieve(stripeAccountId);

//     if (account.details_submitted) {
//       return res.status(200).json({
//         url: null,
//         message: 'Stripe account already fully onboarded.',
//         alreadyOnboarded: true,
//       });
//     }

//     // 5. ✅ Create the onboarding link using saved/existing account ID
//     const accountLink = await stripe.accountLinks.create({
//       account: stripeAccountId,
//       return_url: `${process.env.SELLER_APP_URL}/seller/connect/return`, // ✅ Use env var
//       refresh_url: `${process.env.SELLER_APP_URL}/seller/connect/refresh`,
//       type: 'account_onboarding',
//     });

//     return res.status(200).json({ url: accountLink.url });
//   } catch (error: any) {
//     if (error?.type?.startsWith('Stripe')) {
//       console.error('Stripe Error:', error.message);
//       return next(new Error(`Stripe error: ${error.message}`));
//     }
//     return next(error);
//   }
// };

// export const loginSeller = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return next(new ValidationError('Email and password are required!'));
//     }

//     const rememberMe = req.headers['x-remember-me'] === 'true';
//     const accessTokenExpiry = rememberMe ? '2d' : '15m'; // Longer if remember me
//     const refreshTokenExpiry = rememberMe ? '15d' : '7d';

//     const seller = await prisma.sellers.findUnique({ where: { email } });
//     if (!seller) return next(new AuthError("Seller doesn't exist!"));
//     const isMatch = await bcrypt.compare(password, seller.password);

//     if (!isMatch) {
//       return next(new ValidationError('Invalid email or password!'));
//     }

//     const cookieMaxAge_access = rememberMe
//       ? 2 * 24 * 60 * 60 * 1000
//       : 15 * 60 * 60 * 1000; // 30 days vs 7 days
//     const cookieMaxAge_refresh = rememberMe
//       ? 15 * 24 * 60 * 60 * 1000
//       : 7 * 24 * 60 * 60 * 1000; // 30 days vs 7 days

//     // Clear any existing buyer tokens so sessions don't conflict
//     res.clearCookie('access_token', { path: '/' });
//     res.clearCookie('refresh_token', { path: '/' });

//     if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
//       return next(
//         new AuthError(
//           'Internal Server Error: Missing Token Secrets (for seller)'
//         )
//       );
//     }
//     const accessToken = jwt.sign(
//       { id: seller.id, role: 'seller' },
//       process.env.JWT_ACCESS_SECRET as string,
//       { expiresIn: accessTokenExpiry }
//     );

//     // Generate refresh token if needed
//     const refreshToken = jwt.sign(
//       { id: seller.id, role: 'seller' },
//       process.env.JWT_REFRESH_SECRET as string,
//       { expiresIn: refreshTokenExpiry }
//     );
//     //!  USE THIS IF YOU HAVE BUYER ACCOUNT AND WANT TO AUTOMATICALLY SWITCH
//     // ! BETWEEN TWO ACCOUNT BECAUSE THIS COOKIE NAME SAME AS BUYER ONE

//     // setCookie(res, "refreshToken", refreshToken);
//     // setCookie(res, "accessToken", accessToken);
//     // SHORT CUT
//     // setCookie(res, "seller_refresh_token", refreshToken);
//     // setCookie(res, "seller_refresh_token", accessToken);

//     setCookie(res, 'seller_refresh_token', refreshToken, {
//       maxAge: cookieMaxAge_refresh,
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       path: '/',
//     });

//     setCookie(res, 'seller_refresh_token', accessToken, {
//       maxAge: cookieMaxAge_access,
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       path: '/',
//     });

//     res
//       .status(200)
//       .json({
//         message: 'Login successful!',
//         seller: { id: seller.id, name: seller.name, email: seller.email },
//       });
//   } catch (error) {
//     return next(error);
//   }
// };

// // Get logged-in seller
// export const getSeller = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const seller = req.seller || req.admin;

//   if (!seller) {
//     return res
//       .status(403)
//       .json({ success: false, message: 'Forbidden: Not a seller or Admin' });
//   }

//   try {
//     res.status(200).json({
//       success: true,
//       seller: seller,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Stripe webhook — fires when seller completes onboarding
// export const stripeWebhook = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const sig = req.headers['stripe-signature'] as string;

//   let event: Stripe.Event;
//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body, // ⚠️ Must use raw body — see Step 4
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err: unknown) {
//     return res.status(400).json({ message: 'Webhook signature failed', err });
//   }

//   if (event.type === 'account.updated') {
//     const account = event.data.object as Stripe.Account;

//     // Only update if fully onboarded
//     if (account.details_submitted && account.charges_enabled) {
//       await prisma.sellers.updateMany({
//         where: { stripeId: account.id },
//         data: { stripeOnboarded: true },
//       });
//     }
//   }

//   res.json({ received: true });
// };

// export const sellerForgotPassword = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   await handleForgotPassword(req, res, next, 'seller');
// };

// // Verify forgot password OTP For Seller !
// export const verifySellerForgotPassword = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => await verifyForgotPasswordOtp(req, res, next);

// export const resetSellerPassword = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { email, newPassword } = req.body;
//     if (!email || !newPassword)
//       throw new ValidationError('Email and new password are required!');

//     const seller = await prisma.sellers.findUnique({ where: { email } });
//     if (!seller) return next(new ValidationError('Seller not found!'));

//     // compare new password with the existing one
//     const isSamePassword = await bcrypt.compare(newPassword, seller.password);
//     if (isSamePassword)
//       throw new ValidationError(
//         'New password cannot be the same as the old password!'
//       );

//     // hash the new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     await prisma.sellers.update({
//       where: { email },
//       data: { password: hashedPassword },
//     });

//     res.status(200).json({ message: 'Password reset successfully!' });
//   } catch (error) {
//     return next(error);
//   }
// };

// export const logout = (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const cookieOptions = {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax' as const,
//       path: '/',
//     };

//     // Clear all role-based tokens
//     res.clearCookie('access_token', cookieOptions);
//     res.clearCookie('refresh_token', cookieOptions);
//     res.clearCookie('seller_refresh_token', cookieOptions);
//     res.clearCookie('seller_refresh_token', cookieOptions);
//     res.clearCookie('admin_access_token', cookieOptions);
//     res.clearCookie('admin_refresh_token', cookieOptions);

//     res.status(200).json({ message: 'Logged out successfully.' });
//   } catch (error) {
//     next(error);
//   }
// };
