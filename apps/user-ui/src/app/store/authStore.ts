// apps/user-ui/src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sendKafkaEvent } from '../../actions/track-user';

// ============ TYPES ============
interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  tempEmail: string | null;
  setTempEmail: (email: string | null) => void;
  clearTempEmail: () => void;
  handleLogout: () => void;
}

interface User {
  id: string;
  role: string;
  name?: string;
  email?: string;
}

interface imageType {
  file_id:  string;
  url    :  string;
}

// Product from API
export interface Product {
  id: string;
  title: string;
  regularPrice: number;
  salePrice: number | null;
  images: imageType[];
  shopId: string;
}

// Cart item with calculated price
export interface CartItem extends Product {
  quantity: number;
  effectivePrice: number; // Pre-calculated!
  totalPrice: number;     // Pre-calculated!
}

export interface Store {
  cart: CartItem[];
  wishlist: Product[];
  isModalOpen: boolean;
  setModalOpen: (val: boolean) => void;
  
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
  updateQuantity: (
    id: string,
    quantity: number,
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
  clearCart: () => void;
}

// ============ HELPER FUNCTIONS ============
export const getEffectivePrice = (product: Product): number => {
  return product.salePrice && product.salePrice > 0 && product.salePrice < product.regularPrice
    ? product.salePrice
    : product.regularPrice;
};

export const calculateCartItem = (product: Product, quantity: number): CartItem => {
  const effectivePrice = getEffectivePrice(product);
  return {
    ...product,
    quantity,
    effectivePrice,
    totalPrice: effectivePrice * quantity
  };
};

// ============ STORE ============
export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      isModalOpen: false,
      setModalOpen: (val: boolean) => set({ isModalOpen: val }),

      addToCart: (product, user, location, deviceInfo) => {
        // Send analytics event
        if (user?.id && location?.country && deviceInfo) {
          sendKafkaEvent({
            userId: user.id,
            productId: product.id,
            shopId: product.shopId,
            action: "add_to_cart",
            country: location?.country || "Unknown",
            city: location?.city || "Unknown",
            device: deviceInfo?.type || "Unknown",
          });
        }

        set((state) => {
          const existing = state.cart.find((item) => item.id === product.id);
          
          if (existing) {
            // Update existing item quantity
            const newQuantity = existing.quantity + 1;
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? calculateCartItem(product, newQuantity)
                  : item
              )
            };
          }
          // Add new item with quantity 1
          return {
            cart: [...state.cart, calculateCartItem(product, 1)]
          };
        });
      },

      updateQuantity: (id, quantity, user, location, deviceInfo) => {
        if (quantity < 1) return;
        
        set((state) => {
          const item = state.cart.find((i) => i.id === id);
          if (!item) return state;
          
          // Send analytics for quantity change
          if (user?.id && location?.country && deviceInfo) {
            sendKafkaEvent({
              userId: user.id,
              productId: id,
              shopId: item.shopId,
              action: quantity > item.quantity ? "increase_quantity" : "decrease_quantity",
              country: location?.country || "Unknown",
              city: location?.city || "Unknown",
              device: deviceInfo?.type || "Unknown",
            });
          }
          
          return {
            cart: state.cart.map((item) =>
              item.id === id
                ? { ...item, quantity, totalPrice: item.effectivePrice * quantity }
                : item
            )
          };
        });
      },

      removeFromCart: (id, user, location, deviceInfo) => {
        const removedItem = get().cart.find((item) => item.id === id);
        
        // Send analytics
        if (user?.id && location?.country && deviceInfo && removedItem) {
          sendKafkaEvent({
            userId: user.id,
            productId: removedItem.id,
            shopId: removedItem.shopId,
            action: "remove_from_cart",
            country: location?.country || "Unknown",
            city: location?.city || "Unknown",
            device: deviceInfo?.type || "Unknown",
          });
        }

        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id)
        }));
      },

      clearCart: () => {
        set({ cart: [] });
      },

      addToWishlist: (product, user, location, deviceInfo) => {
        if (user?.id && location?.country && deviceInfo) {
          sendKafkaEvent({
            userId: user.id,
            productId: product.id,
            shopId: product.shopId,
            action: "add_to_wishlist",
            country: location?.country || "Unknown",
            city: location?.city || "Unknown",
            device: deviceInfo?.type || "Unknown",
          });
        }

        set((state) => {
          const exists = state.wishlist.some((item) => item.id === product.id);
          if (exists) return state;
          return {
            wishlist: [...state.wishlist, product]
          };
        });
      },

      removeFromWishlist: (id, user, location, deviceInfo) => {
        const removedItem = get().wishlist.find((item) => item.id === id);
        
        if (user?.id && location?.country && deviceInfo && removedItem) {
          sendKafkaEvent({
            userId: user.id,
            productId: removedItem.id,
            shopId: removedItem.shopId,
            action: "remove_from_wishlist",
            country: location?.country || "Unknown",
            city: location?.city || "Unknown",
            device: deviceInfo?.type || "Unknown",
          });
        }

        set((state) => ({
          wishlist: state.wishlist.filter((item) => item.id !== id)
        }));
      }
    }),
    {
      name: 'store-storage',
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist
      })
    }
  )
);

// ============ AUTH STORE ============
export const useAuthState = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => {
        set({ user: null, tempEmail: null });
        // Also clear cart on logout
        useStore.getState().clearCart();
      },
      
      tempEmail: null,
      setTempEmail: (email) => set({ tempEmail: email }),
      clearTempEmail: () => set({ tempEmail: null }),

      handleLogout: () => {
        set({ user: null, tempEmail: null });
        useStore.getState().clearCart();
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('store-storage');
          
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        tempEmail: state.tempEmail 
      }),
    }
  )
);

// ============ SELECTORS ============

  export const useUser_State = () => useAuthState((state) => state.user);
  export const useTempEmail = () => useAuthState((state) => state.tempEmail);
  export const useCart = () => useStore((state) => state.cart);
  export const useCartTotal = () => {
    const cart = useStore((state) => state.cart);
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
};
export const useCartItemCount = () => {
  const cart = useStore((state) => state.cart);
  return cart.reduce((sum, item) => sum + item.quantity, 0);
};