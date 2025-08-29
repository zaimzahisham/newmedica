"use client";

import { useAuthStore } from '@/store/authStore';
import { Mail, MapPin, Phone, User as UserIcon, Briefcase, Building, FileText, AtSign, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'; // Import useState
import { getOrders } from '@/lib/api/orders'; // Import getOrders
import { Order } from '@/types'; // Import Order
import OrderDetailsModal from '@/components/OrderDetailsModal'; // Import OrderDetailsModal
import { AnimatePresence } from 'framer-motion'; // New import

const AccountPage = () => {
  const { user, loading, logout, token } = useAuthStore();
  const router = useRouter();

  // Move useState declarations here
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // New state for modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // New state for selected order

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    const fetchRecentOrders = async () => {
      if (!user || !token) return; // Ensure user and token are available
      try {
        setOrdersLoading(true);
        const fetchedOrders = await getOrders();
        // Take the first 3 orders for "Recent Orders"
        setRecentOrders(fetchedOrders.slice(0, 3));
      } catch (err) {
        setOrdersError((err as Error).message);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchRecentOrders();
  }, [user, token, loading, router]);

  // New functions for modal
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  if (loading || !user) {
    return <div>Loading...</div>; // or a loading spinner
  }

  const incompleteFields = [];
  if (!user.gender) incompleteFields.push('Gender');
  if (!user.dateOfBirth) incompleteFields.push('Date of Birth');

  if (user.userType === 'Healthcare') {
    if (!user.icNo) incompleteFields.push('IC No');
    if (!user.hpNo) incompleteFields.push('HP No');
    if (!user.hospitalName) incompleteFields.push('Hospital Name');
    if (!user.department) incompleteFields.push('Department');
    if (!user.position) incompleteFields.push('Position');
  }

  if (user.userType === 'Agent') {
    if (!user.icNo) incompleteFields.push('IC No');
    if (!user.hpNo) incompleteFields.push('HP No');
    if (!user.companyName) incompleteFields.push('Company Name');
    if (!user.companyAddress) incompleteFields.push('Company Address');
    if (!user.coRegNo) incompleteFields.push('Co Reg No');
    if (!user.coEmailAddress) incompleteFields.push('Co Email Address');
    if (!user.tinNo) incompleteFields.push('TIN No');
    if (!user.picEinvoice) incompleteFields.push('PIC of E-invoice');
    if (!user.picEinvoiceEmail) incompleteFields.push('PIC of E-invoice Email');
    if (!user.picEinvoiceTelNo) incompleteFields.push('PIC of E-invoice Tel No');
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Hi, {user.firstName}</h1>
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
                <p className="text-gray-500 mb-4">You haven't placed any orders recently.</p>
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
                    <div className="mt-3 text-right">
                      <button onClick={() => handleViewDetails(order)} className="text-blue-600 hover:underline text-sm">
                        View Details
                      </button>
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
                <form>
                  {incompleteFields.map((field) => (
                    <div key={field} className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">{field}</label>
                      <input type="text" placeholder={field} className="border p-2 rounded-md w-full mt-1" />
                    </div>
                  ))}
                  <button className="bg-black text-white w-full py-2 rounded-full">Complete</button>
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
