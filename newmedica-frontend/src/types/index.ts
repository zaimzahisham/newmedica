export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  videoUrl: string;
  brochureUrl: string;
  image?: string;
  image2?: string;
  dateAdded?: string;
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