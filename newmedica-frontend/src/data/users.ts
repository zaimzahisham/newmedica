
import { User } from '@/types';

export const users: User[] = [
  {
    id: '1',
    firstName: 'Rae',
    email: 'rae@newmedica.com',
    userType: 'Admin',
    addresses: [
      {
        id: 'addr1',
        street: '123 Admin Ave',
        city: 'Kuala Lumpur',
        state: 'Kuala Lumpur',
        zipCode: '50000',
        country: 'Malaysia',
        isDefault: true,
      },
    ],
  },
  {
    id: '2',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    userType: 'Healthcare',
    icNo: '123456-78-9012',
    hpNo: '012-3456789',
    hospitalName: 'General Hospital',
    department: 'Cardiology',
    position: 'Doctor',
  },
  {
    id: '3',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    userType: 'Agent',
    icNo: '987654-32-1098',
    hpNo: '019-8765432',
    companyName: 'Pharma Inc.',
    companyAddress: '123 Pharma Street, 45678 KL',
    coRegNo: '123456-X',
    coEmailAddress: 'contact@pharmainc.com',
    tinNo: 'C123456789',
    picEinvoice: 'Mr. Finance',
    picEinvoiceEmail: 'finance@pharmainc.com',
    picEinvoiceTelNo: '03-12345678',
  },
  {
    id: '4',
    firstName: 'Basic',
    lastName: 'User',
    email: 'basic.user@example.com',
    userType: 'Basic',
  }
];