

import { createAuthClient } from "better-auth/react";
import { jwtClient, emailOTPClient, inferAdditionalFields  } from "better-auth/client/plugins"
import type { auth } from "@apps/auth-service";


export const authClient = createAuthClient({
    plugins: [
    inferAdditionalFields<typeof auth>(), 
     jwtClient(),
     emailOTPClient() 
  ],
    baseURL: "http://localhost:7777/api" ,

       fetchOptions: {
        credentials: "include"
    }
});

export const { useSession, signIn, signOut } = authClient;
