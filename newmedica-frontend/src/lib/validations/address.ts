import { z } from 'zod';

export const addressSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().min(6, 'Phone is required'),
  address1: z.string().min(1, 'Address line 1 is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postcode: z.string().min(3, 'Postcode is required'),
  country: z.string().min(1, 'Country is required'),
  is_primary: z.boolean().optional().default(false),
});

export type AddressFormValues = z.infer<typeof addressSchema>;


