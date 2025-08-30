import { Cart, CartItemCreate, CartItemUpdate } from '@/types';
import { getAuthToken } from '../utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getCart(): Promise<Cart> {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found.');

  const response = await fetch(`${API_URL}/api/v1/cart`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      // If the cart is not found, return an empty cart structure
      return { id: '', user_id: '', items: [], total: 0, subtotal: 0, discount: 0, shipping: 0};
    }
    throw new Error('Failed to fetch cart');
  }
  return response.json();
}

export async function addToCart(item: CartItemCreate): Promise<Cart> {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found.');

  const response = await fetch(`${API_URL}/api/v1/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    throw new Error('Failed to add item to cart');
  }
  return response.json();
}

export async function updateCartItemQuantity(itemId: string, updates: CartItemUpdate): Promise<Cart> {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found.');

  const response = await fetch(`${API_URL}/api/v1/cart/items/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update cart item quantity');
  }
  return response.json();
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found.');

  const response = await fetch(`${API_URL}/api/v1/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to remove item from cart');
  }
  return response.json();
}
