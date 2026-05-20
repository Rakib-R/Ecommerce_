export {};

declare global {
  namespace Express {
    interface Request {
      // 1. Add the base role property
      role?: 'admin' | 'seller' | 'user';

      // 2. Add the userInfo property used in your middleware
      userInfo?: {
        id: string;
        role: string;
      };

      admin?: {
        id: string;
        email?: string;
        role: "admin";
      };

      seller?: {
        id: string;
        name: string;
        role: "seller";
        shop?: { id: string; name: string } | null; 
      };

      user?: {
        id: string;
        role: "user";
        name?: string;
      };
    }
  }
}


export type role = 'admin' | 'seller' | 'user';

export interface frontendUser {
  id: string;
  name: string;
  email?: string;
  role: role;
  shop?: { id: string; name: string } | null;
}

export interface ShopType {
 
    id: string;
    name: string;
    bio?: string;
    opening_hours: string;
    category?: string;
    coverShop? : imageType[];
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
  sellerId  : string
}