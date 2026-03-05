

// apps/user-ui/src/store/authStore.ts
import { create } from 'zustand';

interface AuthState {
  [x: string]: any;
  tempEmail: string | null;
  setTempEmail: (email: string | null) => void;
  clearTempEmail: () => void;
  handleLogout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  tempEmail: null,
  setTempEmail: (email) => set({ tempEmail: email }),
  clearTempEmail: () => set({ tempEmail: null }),

  handleLogout: () => {
    if (typeof globalThis.window !== "undefined") {
      const location = globalThis.window.location;
      if (location.pathname !== "/login") {
        location.href = "/login";
      }
    }
  },
}));