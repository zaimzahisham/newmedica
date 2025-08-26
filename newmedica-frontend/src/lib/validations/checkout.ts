'use client';

import { z } from 'zod';

export const shippingAddressSchema = z.object({
  phone: z.string().min(1, { message: 'Phone number is required' }),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  address1: z.string().min(1, { message: 'Address is required' }),
  address2: z.string().optional(),
  city: z.string().min(1, { message: 'City is required' }),
  state: z.string().min(1, { message: 'State is required' }),
  postcode: z.string().min(1, { message: 'Postcode is required' }),
  country: z.string().min(1, { message: 'Country is required' }),
  remark: z.string().optional(),
});

export type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>;
