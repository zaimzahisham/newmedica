"use client";

import { useAuthStore } from '@/store/authStore';
import { MapPin, User as UserIcon, Briefcase, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { getOrders, retryPayment } from '@/lib/api/orders';
import { Order } from '@/types';
import OrderDetailsModal from '@/app/(dashboard)/orders/_components/OrderDetailsModal';
import { AnimatePresence } from 'framer-motion';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateUserProfile, ProfileUpdateData } from '@/lib/api/user';
import { showSuccessToast, showErrorAlert } from '@/components/CustomAlert';

const AccountPage = () => {
  const { user, loading, logout, token, fetchUserProfile } = useAuthStore();
  const router = useRouter();

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    const fetchRecentOrders = async () => {
      if (!user || !token) return;
      try {
        setOrdersLoading(true);
        const fetchedOrders = await getOrders();
        setRecentOrders(fetchedOrders.slice(0, 3));
      } catch (err) {
        setOrdersError((err as Error).message);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchRecentOrders();
  }, [user, token, loading, router]);

  const incompleteFields = useMemo(() => {
    if (!user) return [];
    const fields: { name: keyof ProfileUpdateData; label: string }[] = [];
    // Fields for all users
    if (!user.lastName) fields.push({ name: 'lastName', label: 'Last Name' });
    if (!user.hpNo) fields.push({ name: 'hpNo', label: 'HP No' });
    if (!user.gender) fields.push({ name: 'gender', label: 'Gender' });
    if (!user.dateOfBirth) fields.push({ name: 'dateOfBirth', label: 'Date of Birth' });

    // Fields for Healthcare users
    if (user.userType === 'Healthcare') {
      if (!user.icNo) fields.push({ name: 'icNo', label: 'IC No' });
      if (!user.hospitalName) fields.push({ name: 'hospitalName', label: 'Hospital Name' });
      if (!user.department) fields.push({ name: 'department', label: 'Department' });
      if (!user.position) fields.push({ name: 'position', label: 'Position' });
    }

    // Fields for Agent users
    if (user.userType === 'Agent') {
      if (!user.icNo) fields.push({ name: 'icNo', label: 'IC No' });
      if (!user.companyName) fields.push({ name: 'companyName', label: 'Company Name' });
      if (!user.companyAddress) fields.push({ name: 'companyAddress', label: 'Company Address' });
      if (!user.coRegNo) fields.push({ name: 'coRegNo', label: 'Co Reg No' });
      if (!user.coEmailAddress) fields.push({ name: 'coEmailAddress', label: 'Co Email Address' });
      if (!user.tinNo) fields.push({ name: 'tinNo', label: 'TIN No' });
      if (!user.picEinvoice) fields.push({ name: 'picEinvoice', label: 'PIC of E-invoice' });
      if (!user.picEinvoiceEmail) fields.push({ name: 'picEinvoiceEmail', label: 'PIC of E-invoice Email' });
      if (!user.picEinvoiceTelNo) fields.push({ name: 'picEinvoiceTelNo', label: 'PIC of E-invoice Tel No' });
    }
    return fields;
  }, [user]);

  const validationSchema = useMemo(() => {
    const schemaFields: { [key in keyof ProfileUpdateData]?: z.ZodString } = {};
    incompleteFields.forEach(field => {
        schemaFields[field.name] = z.string().min(1, `${field.label} is required`);
    });
    return z.object(schemaFields);
  }, [incompleteFields]);

  type FormData = z.infer<typeof validationSchema>;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    try {
      await updateUserProfile(data as ProfileUpdateData);
      if (token) await fetchUserProfile(token); // Re-fetch user data to update the store
      showSuccessToast("Profile updated successfully!");
    } catch (error) {
      showErrorAlert("Failed to update profile. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleRetryPayment = async (orderId: string) => {
    setRetryingOrderId(orderId);
    try {
      const response = await retryPayment(orderId);
      if (response.payment_url) {
        router.push(response.payment_url);
      }
    } catch (error) {
      console.error("Retry payment failed", error);
      setOrdersError('Failed to retry payment. Please try again.');
    } finally {
      setRetryingOrderId(null);
    }
  };

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Hi, {user.firstName} !</h1>
        <button className="text-sm text-gray-500 hover:underline" onClick={() => logout()}>Log out</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Link href="/account/details" className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <UserIcon className="w-8 h-8 mb-2" />
              <span>My Profile</span>
            </Link>
            <Link href="/account/address" className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <MapPin className="w-8 h-8 mb-2" />
              <span>Address Book</span>
            </Link>
            <Link href="/account/orders" className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Briefcase className="w-8 h-8 mb-2" />
              <span>Order History</span>
            </Link>
            <Link href="/account/vouchers" className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FileText className="w-8 h-8 mb-2" />
              <span>Vouchers</span>
            </Link>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
            {ordersLoading ? (
              <div className="border rounded-lg p-8 text-center">Loading recent orders...</div>
            ) : ordersError ? (
              <div className="border rounded-lg p-8 text-center text-red-500">Error loading orders: {ordersError}</div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                </div>
                <p className="text-gray-500 mb-4">You haven&apos;t placed any orders recently.</p>
                <Link href="/products" className="bg-black text-white px-4 py-2 rounded-full">Continue shopping</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="py-4 border-b last:border-b-0">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg">Order #{order.id.substring(0, 8).toUpperCase()} ...</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">Date: {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="font-bold text-md">Total: {order.currency} {order.total_amount.toFixed(2)}</p>
                    <div className="mt-3 text-right flex justify-end items-center space-x-4">
                      <button onClick={() => handleViewDetails(order)} className="text-blue-600 hover:underline text-sm">
                        View Details
                      </button>
                      {order.payment_status === 'pending' && (
                        <button
                          onClick={() => handleRetryPayment(order.id)}
                          disabled={retryingOrderId === order.id}
                          className="bg-black text-white px-2 py-1 rounded-md hover:bg-gray-800 disabled:bg-gray-400 font-semibold text-sm"
                        >
                          {retryingOrderId === order.id ? 'Processing...' : 'Retry Payment'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="text-center mt-4">
                  <Link href="/account/orders" className="text-blue-600 hover:underline">
                    View All Orders
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="border rounded-lg p-4 mb-8">
            <h2 className="text-xl font-semibold mb-4">Complete your profile</h2>
            {incompleteFields.length > 0 ? (
              <>
                <p className="text-sm text-gray-500 mb-4">Complete the information for better shopping experience</p>
                <form onSubmit={handleSubmit(onSubmit)}>
                  {incompleteFields.map((field) => (
                    <div key={field.name} className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                      {field.name === 'gender' ? (
                        <select
                          {...register(field.name)}
                          className="border p-2 rounded-md w-full mt-1"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : field.name === 'dateOfBirth' ? (
                        <input
                          type="date"
                          {...register(field.name)}
                          className="border p-2 rounded-md w-full mt-1"
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder={field.label}
                          {...register(field.name)}
                          className="border p-2 rounded-md w-full mt-1"
                        />
                      )}
                      {errors[field.name] && (
                        <p className="text-red-500 text-xs mt-1">{errors[field.name]?.message}</p>
                      )}
                    </div>
                  ))}
                  <button type="submit" disabled={isSubmitting} className="bg-black text-white w-full py-2 rounded-full disabled:bg-gray-400">
                    {isSubmitting ? 'Saving...' : 'Complete'}
                  </button>
                </form>
              </>
            ) : (
              <p className="text-sm text-gray-500">Your profile is complete!</p>
            )}
          </div>
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Account Details</h2>
            <div className="bg-gray-800 text-white p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{user.userType} Member</p>
                  <p className="text-sm">Never expire</p>
                </div>
                <div className="w-12 h-12 bg-white text-black flex items-center justify-center rounded-full font-bold text-xl">
                  {user.firstName.charAt(0).toUpperCase()}{user.lastName?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsModal 
            order={selectedOrder}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountPage;
