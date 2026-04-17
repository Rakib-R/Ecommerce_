


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
