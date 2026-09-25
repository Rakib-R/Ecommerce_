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
      // Seller state
      seller: null,
      setSeller: (seller) => set({ seller }),
      logout: () => {
        set({ seller: null, tempEmail: null });
      },

      // Temp email
      tempEmail: null,
      setTempEmail: (email) => set({ tempEmail: email }),
      clearTempEmail: () => set({ tempEmail: null }),

      // Logout handler with redirect
      handleLogout: () => {
        set({ seller: null, tempEmail: null });

        // Remove persisted storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('seller-storage');
        }

        // Redirect to login if not already there
        if (typeof globalThis.window !== 'undefined') {
          const location = globalThis.window.location;
          if (location.pathname !== '/seller-login') {
            location.href = '/seller-login';
          }
        }
      },
    }),
    {
      name: 'seller-storage', // localStorage key
      // Only persist specific fields
      partialize: (state) => ({
        seller: state.seller,
        tempEmail: state.tempEmail,
      }),
    }
  )
);

// Optional: Add selectors for better performance
export const useSeller_State = () => useAuthState((state) => state.seller);
export const useTempEmail = () => useAuthState((state) => state.tempEmail);
