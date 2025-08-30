
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { createAddress, deleteAddress, getAddresses, setPrimaryAddress, updateAddress } from '@/lib/api/address';
import AddressForm from './AddressForm';
import { AnimatePresence, motion } from 'framer-motion';
import { showErrorAlert, showSuccessToast } from '@/components/CustomAlert';

type AddressItem = {
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

const AddressPage = () => {
  const user = useAuthStore((state) => state.user);
  const loadingAuth = useAuthStore((state) => state.loading);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const router = useRouter();
  const [addresses, setAddresses] = useState<AddressItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<AddressItem | null>(null);

  const sortAddresses = (arr: AddressItem[]): AddressItem[] => {
    return [...arr].sort((a, b) => {
      const nameA = `${a.first_name} ${a.last_name}`.trim().toLocaleLowerCase();
      const nameB = `${b.first_name} ${b.last_name}`.trim().toLocaleLowerCase();
      if (nameA !== nameB) return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
      const addrA = a.address1.toLocaleLowerCase();
      const addrB = b.address1.toLocaleLowerCase();
      return addrA.localeCompare(addrB, undefined, { sensitivity: 'base' });
    });
  };

  const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
    exit: { opacity: 0 },
  } as const;

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { delay: 0.05 } },
    exit: { opacity: 0, scale: 0.95 },
  } as const;

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loadingAuth && !user) {
      router.push('/login');
    }
  }, [user, loadingAuth, router]);

  useEffect(() => {
    const load = async () => {
      if (!user || loadingAuth) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getAddresses();
        setAddresses(sortAddresses(data));
      } catch {
        setError('Failed to load addresses');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, loadingAuth]);


  if (loadingAuth) return null;
  if (!user) return null;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link href="/account" className="text-sm text-gray-500 hover:underline">
          &larr; Return to Account Details
        </Link>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Addresses</h1>
        <button
          className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors"
          onClick={() => { setEditing(null); setIsFormOpen(true); }}
        >
          Add a New Address
        </button>
      </div>

      {loading && (
        <div className="text-gray-500">Loading addresses...</div>
      )}
      {error && (
        <div className="text-red-600 text-sm mb-4">{error}</div>
      )}

      {!loading && (addresses?.length ?? 0) > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses!.map((address) => (
            <div key={address.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    {address.first_name} {address.last_name}
                  </p>
                  <p className="text-gray-600">{address.address1}{address.address2 ? `, ${address.address2}` : ''}</p>
                  <p className="text-gray-600">
                    {address.postcode} {address.city}, {address.state}
                  </p>
                  <p className="text-gray-600">{address.country}</p>
                  <p className="text-gray-600 text-sm">{address.phone}</p>
                </div>
                {address.is_primary && (
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                    Primary
                  </span>
                )}
              </div>
              <div className="mt-4 pt-4 border-t flex gap-4 text-sm">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => { setEditing(address); setIsFormOpen(true); }}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 hover:underline"
                  onClick={async () => {
                    try {
                      await deleteAddress(address.id);
                      const refreshed = await getAddresses();
                      setAddresses(sortAddresses(refreshed));
                      showSuccessToast('Address deleted');
                    } catch {
                      setError('Failed to delete address');
                      showErrorAlert('Failed to delete address');
                    }
                  }}
                >
                  Delete
                </button>
                {!address.is_primary && (
                  <button
                    className="text-gray-700 hover:underline"
                    onClick={async () => {
                      try {
                        await setPrimaryAddress(address.id);
                        const refreshed = await getAddresses();
                        setAddresses(sortAddresses(refreshed));
                        showSuccessToast('Primary address updated');
                      } catch {
                        setError('Failed to set primary');
                        showErrorAlert('Failed to set primary address');
                      }
                    }}
                  >
                    Set as Primary
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div className="text-center py-12 border-dashed border-2 rounded-lg">
            <p className="text-gray-500">You have no saved addresses.</p>
          </div>
        )
      )}

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            className="fixed inset-0 bg-black/0 backdrop-blur-md flex justify-center items-center z-50 p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            onClick={() => setIsFormOpen(false)}
          >
            <motion.div
              className="bg-white w-full max-w-2xl rounded-lg p-6 shadow-2xl relative"
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={() => setIsFormOpen(false)}>✕</button>
              <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit Address' : 'Add Address'}</h2>
              <AddressForm
                initialValues={editing ? { ...editing, address2: editing.address2 ?? undefined } : undefined}
                submitLabel={editing ? 'Update Address' : 'Save Address'}
                onCancel={() => setIsFormOpen(false)}
                onSubmit={async (values) => {
                  try {
                    const { is_primary, ...rest } = values;
                    if (editing) {
                      await updateAddress(editing.id, rest);
                      if (is_primary) {
                        await setPrimaryAddress(editing.id);
                      }
                      showSuccessToast('Address updated');
                    } else {
                      const created = await createAddress(rest);
                      if (is_primary) {
                        await setPrimaryAddress(created.id);
                      }
                      showSuccessToast('Address created');
                    }
                    const refreshed = await getAddresses();
                    setAddresses(sortAddresses(refreshed));
                    setIsFormOpen(false);
                    setEditing(null);
                  } catch {
                    setError(editing ? 'Failed to update address' : 'Failed to create address');
                    showErrorAlert(editing ? 'Failed to update address' : 'Failed to create address');
                  }
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddressPage;
