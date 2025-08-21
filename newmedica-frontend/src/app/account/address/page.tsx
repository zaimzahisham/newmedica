
"use client";

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const AddressPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null; // or a loading spinner
  }

  const addresses = user.addresses || [];

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link href="/account" className="text-sm text-gray-500 hover:underline">
          &larr; Return to Account Details
        </Link>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Addresses</h1>
        <button className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors">
          Add a New Address
        </button>
      </div>
      {addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div key={address.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-gray-600">{address.street}</p>
                  <p className="text-gray-600">
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                  <p className="text-gray-600">{address.country}</p>
                </div>
                {address.isDefault && (
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <div className="mt-4 pt-4 border-t flex gap-4 text-sm">
                <button className="text-blue-600 hover:underline">Edit</button>
                <button className="text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-dashed border-2 rounded-lg">
          <p className="text-gray-500">You have no saved addresses.</p>
        </div>
      )}
    </div>
  );
};

export default AddressPage;
