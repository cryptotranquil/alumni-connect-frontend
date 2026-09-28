import type { Product } from "@/types/product";
import { api, getErrorMessage } from "./client";

export async function getMyProductsApi(): Promise<Product[]> {
  try {
    const { data } = await api.get<Product[]>(`/products/my-products`);
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to fetch businesses"));
  }
}

export async function getProductApi(product_id: string): Promise<Product[]> {
  try {
    const { data } = await api.get<Product[]>(`/products/${product_id}`);
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to fetch products"));
  }
}

export async function getBusinessProductsApi(business_id: string): Promise<Product[]> {
  try {
    const { data } = await api.get<Product[]>(`/products/get-business-products/${business_id}`);
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to fetch products"));
  }
}

export async function createProductApi(data: Partial<Product>): Promise<Product> {
  try {
    const { data: product } = await api.post<Product>("/products", data);
    return product;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to create a business"));
  }
}

export async function updateProductApi(product_id: string, data: FormData): Promise<Product> {
  try {
    const { data: updatedProduct } = await api.put<Product>(`/products/${product_id}`, data);
    return updatedProduct;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to update a product"));
  }
}