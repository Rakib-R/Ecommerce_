
export interface imageType {
    file_id: string;
    file_url : string;
}

export interface OrderType{

}

type shop = ShopType['shop'];
export interface ShopType {
  shop: {
    id: string;
    name: string;
    category: string;
    coverShop : imageType[];
    coverBanner: string;
    address?: string;
    followers?: string[];
    opening_hours: string;
    website?:    string;
    sellerId: string;
    socialLinks?: JSON;
    rating?: number;
    seller: {
      name: string;
      avatar : imageType[];
    } 
  };
}

export interface UserType {
  id: string;
  role: 'user';
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
    id : string;
    title: string;
    slug: string;
    short_description: string;
    detailed_description: string;

    category: string;
    subCategory: string;
    brand?: string;
    warranty? : string;

    regularPrice: number;
    salePrice?: number;
    stock: number;
    images:imageType[]
    shop? : shop,

    videoUrl?: string;
    tags: string[] | string;
    colors?: string[];
    sizes?: string[];
    starting_date?: string | Date;
    ending_date?: string | Date;
    discountCodes?: string[];
    customProperties: Record<string, string  | boolean | undefined>;
    customSpecifications: Record<string, string  | boolean | undefined>;
}

export interface ProductPayloadWithDetails extends ProductPayload{
    quantity : number;
    ratings :  number;
    totalSales :number;
    shipOnTime: string | Date;
    returnPolicy: string
}