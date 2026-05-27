

import { createAuthClient } from "better-auth/react";
import { jwtClient, emailOTPClient  } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    plugins: [
     jwtClient(),
     emailOTPClient() 
  ],
    baseURL: "http://localhost:7777/api" ,

       fetchOptions: {
        credentials: "include"
    }
});

export const { useSession, signIn, signOut } = authClient;
