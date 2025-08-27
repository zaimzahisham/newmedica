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
  // Billing (optional for MVP; validated only when provided)
  billingSame: z.boolean().optional(),
  billingFirstName: z.string().optional(),
  billingLastName: z.string().optional(),
  billingAddress1: z.string().optional(),
  billingAddress2: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingPostcode: z.string().optional(),
  billingCountry: z.string().optional(),
});

export type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>;
