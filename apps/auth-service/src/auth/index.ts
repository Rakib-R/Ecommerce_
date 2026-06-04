// apps/auth-service/src/auth/index.ts
import dotenv from "dotenv";
import path from "path";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@packages/prisma";
import { jwt } from "better-auth/plugins";
import { APIError } from "better-auth/api";
import { emailOTP } from "better-auth/plugins";
import { twoFactor } from "better-auth/plugins/two-factor"; 
import { sellerSignUpSchema, signUpSchema } from "../schema/signUpSchema";

import { dash } from "@better-auth/infra";
import type { AppUserInput } from "./types";
import { sendEmail } from "../utils/sendMail";
import { hashPassword, verifyPassword } from "../utils/hashPassword";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({
    path: path.resolve(process.cwd(), "apps/auth-service/.env.local"),
    override: true,
});


const getRootDomain = () => {
    const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:7777";
    if (baseUrl.includes("localhost")) return undefined;
    try {
        const hostname = new URL(baseUrl).hostname;
        return hostname.split(".").slice(-2).join(".");
    } catch {
        return undefined;
    }
};

const rootDomain = getRootDomain();
const isProd = process.env.NODE_ENV === "production";

const authOptions = {
    database: prismaAdapter(prisma, { provider: "mongodb" }),

    emailAndPassword: { 
        enabled: true,
        requireEmailVerification: false,
        autoSignIn: true,
     
        password : {
            hash : hashPassword,
            verify: verifyPassword
        }
     },

    plugins: [
        jwt(),
        twoFactor(),
        // isDevelopment ? [dash({ apiKey: process.env.BETTER_AUTH_API_KEY })] : ([] as const),
        dash(),
        
         emailOTP({
              changeEmail: {
                enabled: true,
                verifyCurrentEmail: true, 
            },
            
            sendVerificationOnSignUp: false, 
           async sendVerificationOTP({ email, otp, type }, ctx) {
            try {
                let subject = "";
                let templateName = "";
                let name = "User";

           const body = ctx?.request?.body as any;
                    if (body?.name) {
                        name = body.name;
                    } else {
                        // Safe fallback check if user profile was written or for actions down the road
                        const targetUser = await prisma.user.findUnique({
                            where: { email: email },
                            select: { name: true }
                        });
                        if (targetUser?.name) name = targetUser.name;
                }

                switch (type) {
                    case "sign-in":
                        subject = "Your Login OTP";
                        templateName = "sign-in";
                        break;

                    case "email-verification":
                        subject = "Verify your email";
                        templateName = "verify-email";
                        break;

                    case "forget-password":
                        subject = "Reset your password";
                        templateName = "forgot-password-user-mail";
                        break;
                    
                    case "change-email":
                        subject = "Verify your new email";
                        templateName = "change-email";
                        break;

                    default:
                        throw new Error("Unknown OTP type");
                }

               await sendEmail({
                    email,
                    subject,
                    templateName,
                    data: { name, otp },
                });

            } catch (err) {
                console.error("❌ EMAIL ERROR:", err);
                throw err;
            }
        }
    }
),

],
    session: {
        modelName: "session", 
        expiresIn: 60 * 60 * 24 * 7, 
        updateAge: 60 * 60 * 24      
    },
    user: {
        fields: { image: "image" },
        additionalFields: {
            isAgreedToTerms: {
                type: "boolean",
                required: true,
                input: true,
         },
            role: { 
                type: "string", 
                required: true, defaultValue: "user", 
                input: true 
            },
           phone_number: { type: "string", required: false, input: true },
           country: { type: "string", required: false, input: true }
        }
    },
    
    databaseHooks: {
            user: {
            create: {
                before: async  (user, ctx) => {
                const body = ctx.context.body as any || {};
              
                if (ctx.path === "/sign-up/email") {
                //todo 1. Better Auth automatically handles the "Email already exists" check.

                if (body.role === "seller") {
                    const parsedSeller = sellerSignUpSchema.safeParse(body);
                    if (!parsedSeller.success) {
                    throw new APIError("BAD_REQUEST", { 
                        message: parsedSeller.error.issues[0].message 
                    });
                     }
                      
                    } 

                else{
                    const parsed = signUpSchema.safeParse(ctx.context.body);
                    if (!parsed.success) {
                        throw new APIError("BAD_REQUEST", { message: parsed.error.issues[0].message });
                    }
                }
            }
                
            const userWithExtras = user as AppUserInput;
                return {
                    data: {
                    ...user,
                    role: userWithExtras.role ?? "user",
                    },
                };
            },

            after: async (user, ctx) => {

                if (!user || !user.id) return;
                const { phone_number, country, avatar  } = ctx.context?.body|| {};

                if (user.role === "seller") {
                    await prisma.sellers.create({
                    data: {
                        authId: user.id,
                        email: user.email,
                        name: user.name,
                        phone_number: phone_number || "",
                        country: country || "",
                    },
                    });

                } else {
                    await prisma.users.create({
                    data: {
                        authId: user.id,
                        email: user.email,
                        name: user.name,
                    },
                    });
                }
                },
            },

            // 🔵 2. The Core Update Block
            update: {
                after: async (user) => {
                
                if (user.emailVerified) {
                    if (user.role === "seller") {
                    // Sync 'emailVerified' to your custom decoupled sellers table
                    await prisma.sellers.update({
                        where: { authId: user.id },
                        data: { emailVerified: true },
                    });
                    } else {
                    // Sync 'emailVerified' to your custom decoupled application users table
                    await prisma.users.update({
                        where: { authId: user.id },
                        data: { emailVerified: true },
                    });
                    }
                }
                },
            },
         }, 

},
    account: { modelName: "account" },
    verification: { modelName: "verification" },
  
    advanced: {
         database: {
            generateId: false, // 🛑 Tells Better Auth NOT to pre-generate string IDs
        },
        trustedProxyHeaders: true, 
        crossSubDomainCookies: { enabled: !!rootDomain, domain: rootDomain },
        defaultCookieAttributes: { secure: isProd, httpOnly: true, sameSite: "lax", domain: rootDomain }
    },
    trustedOrigins: [
        "https://yoursite.com", "http://localhost:7777", "http://127.0.0.1:7777",
        "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:4000", "http://127.0.0.1:4000"
    ],
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID || "YOUR_GITHUB_CLIENT_ID",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "YOUR_GITHUB_CLIENT_SECRET",
            mapProfileToUser: (profile) => ({
                firstName: profile.name?.split(" ")[0] || "",
                lastName: profile.name?.split(" ")[1] || "",
            }),
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "YOUR_GOOGLE_CLIENT_SECRET",
            mapProfileToUser: (profile) => ({
                firstName: profile.given_name,
                lastName: profile.family_name,
            }),
        },
    },
} satisfies import("better-auth").BetterAuthOptions; // Enforces backend type validation safely

export const auth = betterAuth(authOptions);

