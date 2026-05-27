
import { createAuthClient } from "better-auth/react";
import { emailOTPClient, jwtClient , inferAdditionalFields} from "better-auth/client/plugins";

// import type { auth } from "@packages/auth-types"; 
import type { auth } from "@apps/auth-service";
export const authClient = createAuthClient({    
    
    baseURL: "http://localhost:7777/api/auth", 
    plugins: [
        inferAdditionalFields<typeof auth>(),
        jwtClient(),
        emailOTPClient(),
     ],
    // The Gateway routes `/api` straight to your backend auth engine.

    fetchOptions: {
    credentials: "include"
    }
});

export const { useSession, signIn, signOut } = authClient;
