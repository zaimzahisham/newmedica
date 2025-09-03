'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { getApiUrl } from '@/lib/utils/api';
import { Order } from '@/types';

const API_URL = getApiUrl();

function OrderSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [order, setOrder] = useState<Order | null>(null);
  const hasAttemptedRef = useRef(false);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (hasAttemptedRef.current) return;
    hasAttemptedRef.current = true;

    const verifyPayment = async () => {
      setStatus('verifying');
      if (!sessionId) {
        setStatus('error');
        setMessage('No Stripe session ID found in URL.');
        return;
      }

      try {
        const token = getAuthToken();
        if (!token) {
          setStatus('error');
          setMessage('You must be logged in to confirm the order.');
          return;
        }

        // Call the new backend endpoint to verify the session and mark order paid
        const res = await fetch(`${API_URL}/api/v1/orders/verify-payment/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || 'Failed to verify payment.');
        }

        const data: Order = await res.json();
        setOrder(data);
        setStatus('success');
        clearCart(); // Clear cart after successful order verification
      } catch (err) {
        setStatus('error');
        setMessage((err as Error).message || 'We could not confirm your order payment. Please contact support if you were charged.');
      }
    };

    verifyPayment();
  }, [searchParams, clearCart]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      {status === 'verifying' && (
        <>
          <h1 className="text-2xl font-semibold mb-2">Verifying your payment…</h1>
          <p className="text-gray-600">Please wait a moment.</p>
        </>
      )}
      {status === 'success' && (
        <>
          <h1 className="text-2xl font-semibold mb-2">Thank you! Your order is confirmed.</h1>
          {order && <p className="text-gray-600">Order ID: {order.id.toUpperCase()}</p>}
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link href="/products" className="px-6 py-2 rounded-full bg-black text-white hover:bg-gray-800">Continue Shopping</Link>
            <Link href="/account/orders" className="px-6 py-2 rounded-full border">Go to Orders</Link>
          </div>
        </>
      )}
      {status === 'error' && (
        <>
          <h1 className="text-2xl font-semibold mb-2">We hit a snag.</h1>
          <p className="text-gray-600">{message}</p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <button onClick={() => router.push('/cart')} className="px-6 py-2 rounded-full border">Back to Cart</button>
            <Link href="/products" className="px-6 py-2 rounded-full bg-black text-white hover:bg-gray-800">Browse Products</Link>
          </div>
        </>
      )}
    </div>
  );
}

export default OrderSuccess;
