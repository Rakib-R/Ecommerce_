// packages/auth-types/src/lib/auth-types.ts
import type { User as BaseUser, Session as BaseSession } from 'better-auth';

// Define your application's user shape with custom fields
export interface User extends BaseUser {
  role?: string;
  isAgreedToTerms?: boolean;
}

// export interface Session extends BaseSession {}
