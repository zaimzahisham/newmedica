import { getAuthToken } from '../utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type ProfileUpdateData = {
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  hpNo?: string;
  icNo?: string;
  hospitalName?: string;
  department?: string;
  position?: string;
  companyName?: string;
  companyAddress?: string;
  coRegNo?: string;
  coEmailAddress?: string;
  tinNo?: string;
  picEinvoice?: string;
  picEinvoiceEmail?: string;
  picEinvoiceTelNo?: string;
};

export const updateUserProfile = async (data: ProfileUpdateData) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found.');
  }

  const response = await fetch(`${API_URL}/api/v1/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Catch if response is not JSON
    console.error('Failed to update profile:', errorData);
    throw new Error('Failed to update profile');
  }

  return response.json();
};