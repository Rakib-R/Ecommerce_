export {};

// 1. Define and export the type
export type UserRole = 'user' | 'seller';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name?: string;
        role: UserRole; // 2. Use it here
        emailVerified: boolean;
      };
      session?: Session;
    }
  }
}

export interface ShopType {
  id: string;
  name: string;
  bio?: string;
  opening_hours: string;
  category?: string;
  coverShop?: imageType[];
  coverBanner?: string;
  socialLinks?: Record<string, unknown> | null;
  address?: string;
  followers?: string[];
  sellerId: string;
  rating?: number;
  website?: string;
  seller: {
    name: string;
  };
}

export interface DiscountCodeType {
  id: string;
  public_name: string;
  discount_value: number;
  discount_type: string;
  sellerId: string;
}
