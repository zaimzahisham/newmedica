
export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: string;
  category: Category;
  media: ProductMedia[];
}

export interface ProductMedia {
  id: string;
  media_type: string;
  url: string;
  display_order: number;
}

export type UserType = 'Basic' | 'Agent' | 'Healthcare' | 'Admin';

export interface User {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  userType: UserType;
  gender?: string;
  dateOfBirth?: string;
  icNo?: string;
  hpNo?: string;
  hospitalName?: string;
  department?: string;
  position?: string; // Staff Nurse/ Sister/ Matron/ AMO/ Doctors/ others
  companyName?: string;
  companyAddress?: string;
  coRegNo?: string;
  coEmailAddress?: string;
  tinNo?: string;
  picEinvoice?: string;
  picEinvoiceEmail?: string;
  picEinvoiceTelNo?: string;
  addresses?: Address[];
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  total_price: number;
}

export interface CartItemCreate {
  product_id: string;
  quantity: number;
}

export interface CartItemUpdate {
  quantity: number;
}
