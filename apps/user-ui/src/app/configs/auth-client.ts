import { createAuthClient } from 'better-auth/react';
import {
  emailOTPClient,
  jwtClient,
  inferAdditionalFields,
} from 'better-auth/client/plugins';
import type { AuthAdditionalFields } from '@apps/auth-service';

<<<<<<< HEAD
export const authClient = createAuthClient({
  baseURL: 'http://localhost:7777/api/auth',
  plugins: [
    inferAdditionalFields<never, AuthAdditionalFields>(),
    jwtClient(),
    emailOTPClient(),
  ],
  fetchOptions: {
    credentials: 'include',
  },
=======

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
>>>>>>> 9744e8e22b789996b94156049ff05144cc0972e5
});

export const { useSession, signIn, signOut, signUp } = authClient;
