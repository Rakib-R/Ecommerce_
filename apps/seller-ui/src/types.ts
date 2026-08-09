import { auth } from '@apps/auth-service';

export type Seller = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session;

export interface imageType {
  file_id: string;
  file_url: string;
}

export interface SellerType extends Seller {
  id: string;
  name: string;
  email: string;
  shop: ShopType;
  avatar?: imageType;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShopType {
  id: string;
  name: string;
  category: string;
  address: string;

  coverBanner?: string | null;
  coverShop: imageType[]; // Assumes an 'images' type/interface exists
  bio?: string | null;
  opening_hours?: string | null;
  website?: string | null;
  socialLinks?: Record<string, string> | null; // Represents the Json type
  ratings?: number | null;

  sellerId: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations (Optional based on your fetch queries)
  seller?: SellerType;
  // products?: Product[];
  // reviews?: ShopReview[];
  // order?: Order[];
  // followers?: ShopFollowed[];
}
