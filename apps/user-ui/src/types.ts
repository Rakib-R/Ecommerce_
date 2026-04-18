
export interface imageType {
    file_id: string;
    url : string;
}

export interface OrderType{

}

export interface ShopType {
  shop: {
    id: string;
    name: string;
    category: string;
    coverShop : imageType[];
    coverBanner: string;
    description?: string;
    address?: string;
    followers?: string[];
    rating?: number;
    seller: {
      name: string;
      avatar : imageType[];
    } 
  };
}

export interface UserType {
  id: string;
  name: string;
  email: string;
  avatar?: imageType;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileType extends UserType {
  Points: number;
}

export interface UserShippingType extends UserType {
  orders: OrderType[];
  shippingAddresses: string;
}

export interface AuthResponse {
  user: UserType;
  token: string;
}

export interface ProductPayload {
    _id : string;
    title: string;
    slug: string;
    short_description: string;
    detailed_description: string;

    category: string;
    subCategory: string;
    brand?: string;

    regularPrice: number;
    salePrice?: number;
    stock: number;
    images: {
      fileId: string;
      file_url: string;
    }[];

    videoUrl?: string;
    tags: string[] | string;
    colors?: string[];
    sizes?: string[];
    starting_date?: string | Date;
    discountCodes?: string[];
    customProperties: Record<string, string  | boolean | undefined>;
    customSpecifications: Record<string, string  | boolean | undefined>;
}
