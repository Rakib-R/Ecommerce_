

import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins"
import type { Auth } from "@packages/auth-types"; 

export const authClient = createAuthClient<Auth>({    
    
    plugins: [  jwtClient() ],
    // The Gateway routes `/api` straight to your backend auth engine.
    baseURL: "http://localhost:7777/api",

    fetchOptions: {
    credentials: "include"
    }
});

// Destructure the useful hooks for your frontend views
export const { useSession, signIn, signOut } = authClient;
