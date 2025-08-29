import { Order } from '@/types';
import { getAuthToken } from '../utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getOrders(): Promise<Order[]> {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found.');

  const response = await fetch(`${API_URL}/api/v1/orders`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return response.json();
}
