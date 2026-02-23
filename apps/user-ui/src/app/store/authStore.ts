// apps/user-ui/src/store/authStore.ts
import { create } from 'zustand';

interface AuthState {
  [x: string]: any;
  tempEmail: string | null;
  setTempEmail: (email: string | null) => void;
  // 1. Add the definition here
  clearTempEmail: () => void;
  
}

export const useAuthStore = create<AuthState>((set) => ({
  tempEmail: null,
  setTempEmail: (email) => set({ tempEmail: email }),
  // 2. Implement the function here
  clearTempEmail: () => set({ tempEmail: null }),

 handleLogout:  () => {
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

}));

