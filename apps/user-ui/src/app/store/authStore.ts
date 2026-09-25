// apps/user-ui/src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserType } from '../../types';

// ============ TYPES ============
interface AuthState {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  tempEmail: string | null;
  setTempEmail: (email: string | null) => void;
  clearTempEmail: () => void;
  handleLogout: () => void;
}

// ============ AUTH STORE ============
export const useAuthState = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),

      tempEmail: null,
      setTempEmail: (email) => set({ tempEmail: email }),
      clearTempEmail: () => set({ tempEmail: null }),

      handleLogout: () => {
        set({ user: null, tempEmail: null });
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        tempEmail: state.tempEmail,
      }),
    }
  )
);

// ============ AUTH SELECTORS ==========

export const useUser_State = () => useAuthState((state) => state.user);

export const useTempEmail = () => useAuthState((state) => state.tempEmail);
