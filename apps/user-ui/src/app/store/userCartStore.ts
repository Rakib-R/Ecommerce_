import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sendKafkaEvent } from '../../actions/track-user';
import { ProductPayload, UserType } from '../../types';

export type AddToCartPayload = {
  product: ProductPayload;
  user: UserType;
  quantity: number;
  selectedOptions?: {
    color: string;
    size: string;
  };
  location?: { country: string; city: string };
  deviceInfo?: {
    type: string;
  };
};

export type RemoveFromCartPayload = {
  id: string;
  user: UserType;
  location: { country: string; city: string };
  deviceInfo: { type: string };
};

export type RemoveFromWishlistPayload = {
  id: string;
  user: UserType;
  location: { country: string; city: string };
  deviceInfo: { type: string };
};

export type AddToWishlistPayload = {
  product: ProductPayload;
  user: UserType;
  quantity: number;
  selectedOptions?: {
    color: string;
    size: string;
  };
  location?: { country: string; city: string };
  deviceInfo?: {
    type: string;
  };
};

// Cart item with calculated price
export interface CartItem extends ProductPayload {
  quantity: number;
  getExactRegularPrice: number; // Pre-calculated!
  totalPrice: number; // Pre-calculated!
}

export interface Store {
  cart: CartItem[];
  wishlist: ProductPayload[];
  isModalOpen: boolean;
  setModalOpen: (val: boolean) => void;

  addToCart: (params: AddToCartPayload) => void;

  removeFromCart: (params: RemoveFromCartPayload) => void;

  updateQuantity: (
    id: string,
    quantity: number,
    user: UserType,
    location: { country: string; city: string },
    deviceInfo: {
      type: string;
    }
  ) => void;

  addToWishlist: (params: AddToWishlistPayload) => void;

  removeFromWishlist: (params: RemoveFromWishlistPayload) => void;

  clearCart: () => void;
}
// ============ HELPER FUNCTIONS ============
export const getRegularPrice__ = (product: ProductPayload): number => {
  return product.salePrice &&
    product.salePrice > 0 &&
    product.salePrice < product.regularPrice
    ? product.salePrice
    : product.regularPrice;
};

export const calculateCartItem = (
  product: ProductPayload,
  quantity: number
) => {
  const getExactRegularPrice = getRegularPrice__(product);
  return {
    ...product,
    quantity,
    getExactRegularPrice,
    totalPrice: getExactRegularPrice * quantity,
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

      addToCart: ({ product, user, location, deviceInfo }) => {
        //todo Send analytics event
        if (user?.id && location?.country && deviceInfo) {
          sendKafkaEvent({
            userId: user.id,
            productId: product.id,
            shopId: product.shop?.id,
            action: 'add_to_cart',
            country: location?.country || 'Unknown',
            city: location?.city || 'Unknown',
            device: deviceInfo?.type || 'Unknown',
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
              ),
            };
          }
          // Add new item with quantity 1
          return {
            cart: [...state.cart, calculateCartItem(product, 1) as CartItem],
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
              shopId: item.shop?.id,
              action:
                quantity > item.quantity
                  ? 'increase_quantity'
                  : 'decrease_quantity',
              country: location?.country || 'Unknown',
              city: location?.city || 'Unknown',
              device: deviceInfo?.type || 'Unknown',
            });
          }

          return {
            cart: state.cart.map((item) =>
              item.id === id
                ? {
                    ...item,
                    quantity,
                    totalPrice: item.getExactRegularPrice * quantity,
                  }
                : item
            ),
          };
        });
      },

      removeFromCart: ({
        id,
        user,
        location,
        deviceInfo,
      }: RemoveFromCartPayload) => {
        const removedItem = get().cart.find((item) => item.id === id);

        // Send analytics
        if (user?.id && location?.country && deviceInfo && removedItem) {
          sendKafkaEvent({
            userId: user.id,
            productId: removedItem.id,
            shopId: removedItem.shop?.id,
            action: 'remove_from_cart',
            country: location?.country || 'Unknown',
            city: location?.city || 'Unknown',
            device: deviceInfo?.type || 'Unknown',
          });
        }

        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        }));
      },

      clearCart: () => {
        set({ cart: [] });
      },

      addToWishlist: ({
        product,
        user,
        quantity,
        location,
        deviceInfo,
      }: AddToWishlistPayload) => {
        if (user?.id && location?.country && deviceInfo) {
          sendKafkaEvent({
            userId: user.id,
            productId: product.id,
            quantity,
            shopId: product.shop?.id,
            action: 'add_to_wishlist',
            country: location?.country || 'Unknown',
            city: location?.city || 'Unknown',
            device: deviceInfo?.type || 'Unknown',
          });
        }

        set((state) => {
          const exists = state.wishlist.some((item) => item.id === product.id);
          if (exists) return state;
          return {
            wishlist: [...state.wishlist, product],
          };
        });
      },

      removeFromWishlist: ({
        id,
        user,
        location,
        deviceInfo,
      }: RemoveFromWishlistPayload) => {
        const removedItem = get().wishlist.find((item) => item.id === id);

        if (user?.id && location?.country && deviceInfo && removedItem) {
          sendKafkaEvent({
            userId: user.id,
            productId: removedItem.id,
            shopId: removedItem.shop?.id,
            action: 'remove_from_wishlist',
            country: location?.country || 'Unknown',
            city: location?.city || 'Unknown',
            device: deviceInfo?.type || 'Unknown',
          });
        }

        set((state) => ({
          wishlist: state.wishlist.filter((item) => item.id !== id),
        }));
      },
    }),
    {
      name: 'store-storage',
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
      }),
    }
  )
);

// ============ STORE SELECTORS ==========
export const useCart = () => useStore((state) => state.cart);

export const useCartTotal = () => {
  const cart = useStore((state) => state.cart);
  return cart.reduce((sum, item) => sum + item.totalPrice, 0);
};

export const useCartItemCount = () => {
  const cart = useStore((state) => state.cart);
  return cart.reduce((sum, item) => sum + item.quantity, 0);
};
