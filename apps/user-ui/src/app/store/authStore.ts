// apps/user-ui/src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sendKafkaEvent } from '../../actions/track-user';


interface AuthState {
  
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
  quantity: number;
  shopId: string;
  
}

export type Store = {
  cart: Product[];
  wishlist: Product[];
  isModalOpen: boolean;
  setModalOpen: (val: boolean) => void,

  addToCart: (
    product: Product,
    user: any,
    location: any,
    deviceInfo: any
  ) => void;
  removeFromCart: (
    id: string,
    user: any,
    location: any,
    deviceInfo: any
  ) => void;
  addToWishlist: (
    product: Product,
    user: any,
    location: any,
    deviceInfo: any
  ) => void;
   removeFromWishlist: (
    id: string,
    user: any,
    location: any,
    deviceInfo: any
  ) => void;

}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      cart: [] as Product[],
      wishlist: [] as Product[],
      isModalOpen: false,
      setModalOpen: (val: boolean) => set({ isModalOpen: val }),


      addToCart: (product, user, location, deviceInfo) => {
        console.log("🔵 addToCart FUNCTION CALLED", { product, user: user?.id });
                 // send kafka event
        if (user?.id && location?.country && deviceInfo) {
            sendKafkaEvent({
            userId: user.id,
            productId: product?.id,
            shopId: product?.shopId,
            action: "add_to_cart",
            country: location?.country || "Unknown",
            city: location?.city || "Unknown",
            device: deviceInfo?.type || "Unknown",
        });
      }
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
        //   console.log("Sending add_to_cart event:", {
        //     userId: user?.id,
        //     productId: product?.id,
        //     shopId: product?.shopId,
        //     action: "add_to_cart"
        // });
          return {
            cart: [...state.cart, { ...product,quantity: product?.quantity }]
          };
        });
    },

      removeFromCart: (id, user, location, deviceInfo) => {
        const removeProduct = get().cart.find((item) => item.id === id);
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id)
        }));
             // send kafka event
        if (user?.id && location?.country && deviceInfo && removeProduct) {
          sendKafkaEvent({
            userId: user.id,
            productId: removeProduct?.id,
            shopId: removeProduct?.shopId,
            action: "remove_from_cart",
            country: location?.country || "Unknown",
            city: location?.city || "Unknown",
            device: deviceInfo?.type || "Unknown",

        });
      }
    },

      addToWishlist: (product, user, location, deviceInfo) => {
         if (user?.id && location?.country && deviceInfo  ) {
          sendKafkaEvent({
            userId: user.id,
            productId: product?.id,
            shopId: product?.shopId,
            action: "add_to_wishlist",
            country: location?.country || "Unknown",
            city: location?.city || "Unknown",
            device: deviceInfo?.type || "Unknown",
        });
      }

        set((state) => ({
          wishlist: [...state.wishlist, product]
        }));
        
      //    console.log("Sending add_to_wishlist event:", {
      //       userId: user?.id,
      //       productId: product?.id,
      //       shopId: product?.shopId,
      //       action: "add_Wishlist"
      // });

    },

      removeFromWishlist: (id, user, location, deviceInfo) => {
        const removeProduct = get().wishlist.find((item) => item.id === id); 
              if (user?.id && location?.country && deviceInfo && removeProduct ) {
          sendKafkaEvent({
            userId: user.id,
            productId: removeProduct?.id,
            shopId: removeProduct?.shopId,
            action: "remove_from_wishlist",
            country: location?.country || "Unknown",
            city: location?.city || "Unknown",
            device: deviceInfo?.type || "Unknown",
        });
      }

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

      handleLogout: () => {
        // Clear all auth state
        set({ user: null, tempEmail: null });
        
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
      name: 'auth-storage',
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