import { UserRole } from 'packages/utils/src/global';

export type AppUserInput = {
  isAgreedToTerms?: boolean;
  email: string;
  role?: string;
};

declare module 'better-auth' {
  // 💡 This instructs your client that passing extra parameters here is completely legal
  interface SignUpEmailInput {
    role?: UserRole;
    phone_number?: string;
    country?: string;
  }
}
