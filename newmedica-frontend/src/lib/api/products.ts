import { Category, Product } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/api/v1/categories`);
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
}

export async function getProducts(
  category?: string,
  search?: string,
  sortBy?: string
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (category) {
    params.append('category', category);
  }
  if (search) {
    params.append('search', search);
  }
  if (sortBy) {
    params.append('sort_by', sortBy);
  }

  const url = `${API_URL}/api/v1/products?${params.toString()}`;
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
}

export async function getProductById(id: string): Promise<Product> {
  const response = await fetch(`${API_URL}/api/v1/products/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }
  return response.json();
}
