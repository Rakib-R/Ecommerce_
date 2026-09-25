import { createAuthClient } from 'better-auth/react';
import {
  emailOTPClient,
  jwtClient,
  inferAdditionalFields,
} from 'better-auth/client/plugins';
import type { AuthAdditionalFields } from '@apps/auth-service';

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
});
