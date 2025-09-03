import { Order, PaymentResponse } from '@/types';
import { getAuthToken } from '../utils';

import { getApiUrl } from '../utils/api';
const API_URL = getApiUrl();

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

export async function retryPayment(orderId: string): Promise<PaymentResponse> {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found.');

  const response = await fetch(`${API_URL}/api/v1/orders/${orderId}/retry-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to retry payment');
  }
  return response.json();
}
