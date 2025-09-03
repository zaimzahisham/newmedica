'use client';
import React, { useEffect, useState } from 'react';
import { getOrders, retryPayment } from '@/lib/api/orders';
import { Order } from '@/types';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Briefcase } from 'lucide-react';
import OrderDetailsModal from '@/app/(dashboard)/orders/_components/OrderDetailsModal';
import { AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { formatVoucherCode } from '@/lib/utils';

const OrdersPage = () => {
  const { user, token, loading: loadingAuth, checkAuth } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'paid'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loadingAuth && !user) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      if (!user || !token) return;
      try {
        const fetchedOrders = await getOrders();
        setOrders(fetchedOrders);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    if (!loadingAuth && user && token) {
      fetchOrders();
    }
  }, [user, token, loadingAuth, router]);

  const filteredOrders = orders.filter(order => {
    if (selectedTab === 'all') return true;
    return order.payment_status === selectedTab;
  });

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
        window.location.href = response.payment_url;
      }
    } catch (error) {
      console.error("Retry payment failed", error);
      setError('Failed to retry payment. Please try again.');
    } finally {
      setRetryingOrderId(null);
    }
  };

  if (loadingAuth || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-gray-800 mr-4">
          <ArrowLeft size={20} className="mr-1" />
          <span className="text-lg">Back</span>
        </button>
      </div>
      <h1 className="text-3xl font-bold mb-3">Order History</h1>
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 text-lg font-medium ${selectedTab === 'all' ? 'border-b-2 border-black text-black' : 'text-gray-600'}`}
          onClick={() => setSelectedTab('all')}
        >
          All Orders
        </button>
        <button
          className={`py-2 px-4 text-lg font-medium ${selectedTab === 'pending' ? 'border-b-2 border-black text-black' : 'text-gray-600'}`}
          onClick={() => setSelectedTab('pending')}
        >
          Pending Payment
        </button>
        <button
          className={`py-2 px-4 text-lg font-medium ${selectedTab === 'paid' ? 'border-b-2 border-black text-black' : 'text-gray-600'}`}
          onClick={() => setSelectedTab('paid')}
        >
          Paid
        </button>
      </div>

      {
        filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-6 mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <Briefcase size={64} className="text-gray-500" />
            </div>
            <p className="text-gray-500 text-lg mb-4">Oops, no orders found for this status.</p>
            <Link href="/products" className="bg-black text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-gray-800 transition-colors">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="border-b border-gray-200 py-4 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h2 className="text-xl font-semibold">Order #{order.id.toUpperCase()}</h2>
                    <p className="text-gray-600 text-sm">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    {order.applied_voucher_code && (
                      <p className="text-gray-600 text-sm">Voucher: {formatVoucherCode(order.applied_voucher_code)}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                    order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </span>
                </div>
                
                <div className="mt-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center mb-2 last:mb-0">
                      <Image 
                        src={item.snapshot_media_url || `/placeholder-product.png`}
                        alt={item.snapshot_name || 'Product Image'}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded-md mr-4"
                      />
                      <div>
                        <p className="font-semibold">{item.snapshot_name || 'Product'}</p>
                        <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                        <p className="font-bold">{order.currency} {item.line_total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-2">
                  <p className="text-lg font-semibold">Total:</p>
                  <p className="text-xl font-bold">{order.currency} {order.total_amount.toFixed(2)}</p>
                </div>

                <div className="mt-4 flex justify-end items-center space-x-4">
                  <button onClick={() => handleViewDetails(order)} className="text-blue-600 hover:underline font-semibold">
                    View Details
                  </button>
                  {order.payment_status === 'pending' && (
                    <button
                      onClick={() => handleRetryPayment(order.id)}
                      disabled={retryingOrderId === order.id}
                      className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 disabled:bg-gray-400 font-semibold"
                    >
                      {retryingOrderId === order.id ? 'Processing...' : 'Retry Payment'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      }
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

export default OrdersPage;
