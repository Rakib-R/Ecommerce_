import { Role } from '../lib/auth-types';

export type AppUserInput = {
  id: string;
  isAgreedToTerms?: boolean;
  email: string;
  role?: string;
};

declare module 'better-auth' {
  // 💡 This instructs your client that passing extra parameters here is completely legal
  interface SignUpEmailInput {
    role?: Role;
    phone_number?: string;
    country?: string;
  }
}
