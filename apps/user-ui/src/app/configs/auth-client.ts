

import { createAuthClient } from "better-auth/react"; // 👈 Ensure /react is targeted here
import { emailOTPClient, jwtClient, inferAdditionalFields } from "better-auth/client/plugins"; // 👈 Fixed this path

const additionalFields = {
  user: {
    isAgreedToTerms: { type: "boolean", required: true, input: true },
    role: { type: "string", required: true, defaultValue: "user", input: true },
    phone_number: { type: "string", required: false, input: true },
    country: { type: "string", required: false, input: true },
  },
} as const;

export const authClient = createAuthClient({
  baseURL: "http://localhost:7777/api/auth",
  plugins: [
    inferAdditionalFields(additionalFields),
    jwtClient(),
    emailOTPClient()
  ],
  fetchOptions: {
    credentials: "include"
  }
});

export const { useSession, signIn, signOut } = authClient;
