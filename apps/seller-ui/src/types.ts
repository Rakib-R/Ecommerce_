


export interface imageType {
  file_id: string;
  url : string;
}

export interface SellerType {
  id: string;
  name: string;
  email: string;
  avatar?: imageType;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface SellerType {
  user: SellerType;
  token: string;
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
  socialLinks?: Record<string, any> | null; // Represents the Json type
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

