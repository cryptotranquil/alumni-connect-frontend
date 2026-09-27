export type ProductStatus = 'pending' | 'approved';

export interface Product {
  _id: string;
  businessId: string;
  name: string;
  price: number;
  quantity: number;
  category: "Electronics" | "Part time Classes";
  description: string;
  imageUrl?: string;
  inStock: boolean;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

