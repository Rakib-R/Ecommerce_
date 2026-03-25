// apps/user-ui/src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Seller {
  id: string;
  role: string;
  name?: string;
  email?: string;
}

interface AuthState {
  // User state
  seller: Seller | null;
  setSeller: (seller: Seller | null) => void;
  logout: () => void;
  
  // Temp email for registration flow
  tempEmail: string | null;
  setTempEmail: (email: string | null) => void;
  clearTempEmail: () => void;
  
  // Logout handler with redirect
  handleLogout: () => void;
}

export const useAuthState = create<AuthState>()(
  persist(
    (set) => ({
      // User state
      seller: null,
      setSeller: (seller) => set({ seller }),
      logout: () => {
        set({ seller: null, tempEmail: null });
        // Clear any other auth-related state
      },

      // Temp email
      tempEmail: null,
      setTempEmail: (email) => set({ tempEmail: email }),
      clearTempEmail: () => set({ tempEmail: null }),
      
      // Logout handler with redirect
      handleLogout: () => {
        // Clear all auth state
        set({ seller: null, tempEmail: null });
        
        // Remove persisted storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
        }
        
        // Redirect to login if not already there
        if (typeof globalThis.window !== "undefined") {
          const location = globalThis.window.location;
          if (location.pathname !== "/seller-login") {
            location.href = "/seller-login";
          }
        }
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      // Only persist specific fields
      partialize: (state) => ({ 
        seller: state.seller,
        tempEmail: state.tempEmail 
      }),
    }
  )
);

// Optional: Add selectors for better performance
export const useSeller_State = () => useAuthState((state) => state.seller);
export const useTempEmail = () => useAuthState((state) => state.tempEmail);