
"use client";

import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { Lock, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPrimaryAddress } from '@/lib/api/address';

const AccountDetailsPage = () => {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [dobType, setDobType] = useState(user?.dateOfBirth ? 'date' : 'text');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null; // Or a loading spinner
  }

  const [primaryAddress, setPrimaryAddress] = useState<{
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
  } | null>(null);

  useEffect(() => {
    const loadPrimary = async () => {
      if (!user) return;
      try {
        const addr = await getPrimaryAddress();
        setPrimaryAddress(addr);
      } catch {
        setPrimaryAddress(null);
      }
    };
    loadPrimary();
  }, [user]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/account" className="text-sm text-gray-600 hover:underline flex items-center">
          &larr; Back
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Account</h1>

      <form onSubmit={(e) => e.preventDefault()}>
        {/* Account Details Section */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-2">Account Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
              <input type="text" id="firstName" defaultValue={user.firstName} className="w-full p-3 h-12 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
              <input type="text" id="lastName" defaultValue={user.lastName || ''} className="w-full p-3 h-12 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
              <select id="gender" defaultValue={user.gender || ''} className="w-full p-3 h-12 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-600 mb-1">Date of Birth</label>
              <input
                type={dobType}
                onFocus={() => setDobType('date')}
                onBlur={(e) => {
                  if (!e.target.value) {
                    setDobType('text');
                  }
                }}
                id="dob"
                placeholder="DD/MM/YYYY"
                defaultValue={user.dateOfBirth || ''}
                className="w-full p-3 h-12 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input type="email" id="email" defaultValue={user.email} className="w-full p-3 h-12 border border-gray-300 rounded-md shadow-sm bg-gray-50" readOnly />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
              <input type="tel" id="phone" defaultValue={user.hpNo || ''} className="w-full p-3 h-12 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            {/* UserType Specific Fields */}
            {user.userType === 'Healthcare' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">IC No</label>
                  <input type="text" defaultValue={user.icNo || ''} className="w-full p-3 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Hospital Name</label>
                  <input type="text" defaultValue={user.hospitalName || ''} className="w-full p-3 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Department</label>
                  <input type="text" defaultValue={user.department || ''} className="w-full p-3 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Position</label>
                  <input type="text" defaultValue={user.position || ''} className="w-full p-3 border border-gray-300 rounded-md shadow-sm" />
                </div>
              </>
            )}
            {user.userType === 'Agent' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">IC No</label>
                  <input type="text" defaultValue={user.icNo || ''} className="w-full p-3 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Company Name</label>
                  <input type="text" defaultValue={user.companyName || ''} className="w-full p-3 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Company Address</label>
                  <input type="text" defaultValue={user.companyAddress || ''} className="w-full p-3 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Co Reg No</label>
                  <input type="text" defaultValue={user.coRegNo || ''} className="w-full p-3 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Co Email Address</label>
                  <input type="email" defaultValue={user.coEmailAddress || ''} className="w-full p-3 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">TIN No</label>
                  <input type="text" defaultValue={user.tinNo || ''} className="w-full p-3 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">PIC of E-invoice</label>
                  <input type="text" defaultValue={user.picEinvoice || ''} className="w-full p-3 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">PIC of E-invoice Email</label>
                  <input type="email" defaultValue={user.picEinvoiceEmail || ''} className="w-full p-3 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">PIC of E-invoice Tel No</label>
                  <input type="tel" defaultValue={user.picEinvoiceTelNo || ''} className="w-full p-3 border border-gray-300 rounded-md shadow-sm" />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 mb-10">
            <button type="button" className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800">Submit</button>
        </div>
      </form>

      {/* Primary Address Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-2">Primary Address</h2>
        <div className="border border-gray-200 rounded-md p-6">
          {primaryAddress ? (
            <>
              <p className="font-semibold">{primaryAddress.first_name} {primaryAddress.last_name}</p>
              <p>{primaryAddress.address1}{primaryAddress.address2 ? `, ${primaryAddress.address2}` : ''}</p>
              <p>{primaryAddress.postcode} {primaryAddress.city}, {primaryAddress.state}</p>
              <p>{primaryAddress.country}</p>
            </>
          ) : (
            <p>No primary address set.</p>
          )}
          <Link href="/account/address" className="text-sm text-indigo-600 hover:underline mt-4 inline-block">
            Manage Addresses
          </Link>
        </div>
      </div>

      {/* Authentication Details Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-2">Authentication Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-gray-200 rounded-md p-6 flex items-start">
            <Lock className="w-6 h-6 text-gray-500 mr-4 mt-1" />
            <div>
              <p className="font-semibold text-gray-800">Password</p>
              <button className="text-sm text-indigo-600 hover:underline mt-2">Change password</button>
            </div>
          </div>
          <div className="border border-gray-200 rounded-md p-6 flex items-start">
            <Mail className="w-6 h-6 text-gray-500 mr-4 mt-1" />
            <div>
              <p className="font-semibold text-gray-800">Email</p>
              <p className="text-gray-600">{user.email}</p>
              <button className="text-sm text-indigo-600 hover:underline mt-2">Verify now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetailsPage;