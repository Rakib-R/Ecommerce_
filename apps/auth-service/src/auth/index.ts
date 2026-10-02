// apps/auth-service/src/auth/index.ts
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@packages/prisma';
import { jwt } from 'better-auth/plugins';
import { APIError } from 'better-auth/api';

const getRootDomain = () => {
  const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:7777';
  if (baseUrl.includes('localhost')) return undefined;
  try {
    const hostname = new URL(baseUrl).hostname;
    return hostname.split('.').slice(-2).join('.');
  } catch {
    return undefined;
  }
};

const rootDomain = getRootDomain();
const isProd = process.env.NODE_ENV === 'production';

// apps/auth-service/src/auth/index.ts

// 1. Assign your configuration options to a plain object variable first
const authOptions = {
  database: prismaAdapter(prisma, { provider: 'mongodb' }),
  plugins: [jwt()],
  session: {
    modelName: 'session',
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  user: {
    modelName: 'users',
    fields: { image: 'image' },
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
        input: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if ((user as any).isAgreedToTerms === false) {
            throw new APIError('BAD_REQUEST', {
              message: 'User must agree to the TOS before signing up.',
            });
          }
          return { data: user };
        },
      },
    },
  },
  account: { modelName: 'account' },
  verification: { modelName: 'verification' },
  emailAndPassword: { enabled: true },

  advanced: {
    trustedProxyHeaders: true,
    crossSubDomainCookies: { enabled: !!rootDomain, domain: rootDomain },
    defaultCookieAttributes: {
      secure: isProd,
      httpOnly: true,
      sameSite: 'lax',
      domain: rootDomain,
    },
  },
  trustedOrigins: [
    'https://yoursite.com',
    'http://localhost:7777',
    'http://127.0.0.1:7777',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:4000',
    'http://127.0.0.1:4000',
  ],
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || 'YOUR_GITHUB_CLIENT_ID',
      clientSecret:
        process.env.GITHUB_CLIENT_SECRET || 'YOUR_GITHUB_CLIENT_SECRET',
      mapProfileToUser: (profile) => ({
        firstName: profile.name?.split(' ')[0] || '',
        lastName: profile.name?.split(' ')[1] || '',
      }),
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
      mapProfileToUser: (profile) => ({
        firstName: profile.given_name,
        lastName: profile.family_name,
      }),
    },
  },
} satisfies import('better-auth').BetterAuthOptions; // Enforces backend type validation safely

export const auth = betterAuth(authOptions);
export type auth_types = typeof auth;

// ✅ FIX: Export the type of the CONFIG OPTIONS, not the instantiated server object!
export type AuthOptions = typeof authOptions;
