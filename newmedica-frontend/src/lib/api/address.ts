import { getAuthToken } from '../utils';

import { getApiUrl } from '../utils/api';
const API_URL = getApiUrl();

export type AddressDto = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  address1: string;
  address2?: string | null;
  city: string;
  state: string;
  postcode: string;
  country: string;
  is_primary: boolean;
};

export type AddressCreateInput = {
  first_name: string;
  last_name: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  is_primary?: boolean;
};

export type AddressUpdateInput = Partial<AddressCreateInput>;

export async function getAddresses(): Promise<AddressDto[]> {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found.');

  const response = await fetch(`${API_URL}/api/v1/users/me/addresses`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch addresses');
  }
  return response.json();
}

export async function createAddress(data: AddressCreateInput): Promise<AddressDto> {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found.');

  const response = await fetch(`${API_URL}/api/v1/users/me/addresses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create address');
  }
  return response.json();
}

export async function updateAddress(addressId: string, data: AddressUpdateInput): Promise<AddressDto> {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found.');

  const response = await fetch(`${API_URL}/api/v1/users/me/addresses/${addressId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update address');
  }
  return response.json();
}

export async function deleteAddress(addressId: string): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found.');

  const response = await fetch(`${API_URL}/api/v1/users/me/addresses/${addressId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete address');
  }
}

export async function setPrimaryAddress(addressId: string): Promise<AddressDto> {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found.');

  const response = await fetch(`${API_URL}/api/v1/users/me/addresses/${addressId}/set-primary`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to set primary address');
  }
  return response.json();
}

export async function getPrimaryAddress(): Promise<AddressDto | null> {
  const list = await getAddresses();
  return list.find(a => a.is_primary) ?? null;
}


