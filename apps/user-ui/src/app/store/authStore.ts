// apps/user-ui/src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  
  // Temp email for registration flow
  tempEmail: string | null;
  setTempEmail: (email: string | null) => void;
  clearTempEmail: () => void;
  
  // Logout handler with redirect
  handleLogout: () => void;
}

interface User {
  id: string;
  role: string;
  name?: string;
  email?: string;
}

export type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity?: number;
  shopId: string;
  
}

export type Store = {
  cart: Product[];
  wishlist: Product[];
  addToCart: (
    product: Product,
    user: any,
    location: string,
    deviceInfo: string
  ) => void;
  removeFromCart: (
    id: string,
    user: any,
    location: string,
    deviceInfo: string
  ) => void;
  addToWishlist: (
    product: Product,
    user: any,
    location: string,
    deviceInfo: string
  ) => void;
   removeFromWishlist: (
    id: string,
    user: any,
    location: string,
    deviceInfo: string
  ) => void;

}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      cart: [] as Product[],
      wishlist: [] as Product[],

      addToCart: (product, user, location, deviceInfo) => {
        set((state) => {
          const existing = state.cart.find((item) => item.id === product.id);
          if (existing) {
            return {
              cart: state.cart.map((item) => 
                item.id === product.id 
                  ? { ...item, quantity: (item.quantity ?? 1) + 1 } 
                  : item
              )
            };
          }
          return {
            cart: [...state.cart, { ...product, quantity: 1 }]
          };
        });
      },

      removeFromCart: (id, user, location, deviceInfo) => {
        const removeProduct = get().cart.find((item) => item.id === id);
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id)
        }));
      },

      addToWishlist: (product, user, location, deviceInfo) => {
        set((state) => ({
          wishlist: [...state.wishlist, product]
        }));
      },

      removeFromWishlist: (id, user, location, deviceInfo) => {
        const removeProduct = get().wishlist.find((item) => item.id === id); 

      set((state) => ({
        wishlist: state.wishlist.filter((item) => item.id !== id)
        }))
      }
    }),
    {
      name: 'store-storage'
    }
  )
);

export const useAuthState = create<AuthState>()(
  persist(
    (set) => ({
      // User state
      user: null,
      setUser: (user) => set({ user }),
      logout: () => {
        set({ user: null, tempEmail: null });
      },
      
      tempEmail: null,
      setTempEmail: (email) => set({ tempEmail: email }),
      clearTempEmail: () => set({ tempEmail: null }),

      // Logout handler with redirect
      handleLogout: () => {
        // Clear all auth state
        set({ user: null, tempEmail: null });
        
        // Remove persisted storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
        }
        // Redirect to login if not already there
        if (typeof globalThis.window !== "undefined") {
          const location = globalThis.window.location;
          if (location.pathname !== "/login") {
            location.href = "/login";
          }
        }
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      // Only persist specific fields
      partialize: (state) => ({ 
        user: state.user,
        tempEmail: state.tempEmail 
      }),
    }
  )
);

// Selectors for better performance
export const useUser_State = () => useAuthState((state) => state.user);
export const useTempEmail = () => useAuthState((state) => state.tempEmail);
export const useIsAuthenticated = () => useAuthState((state) => !!state.user);