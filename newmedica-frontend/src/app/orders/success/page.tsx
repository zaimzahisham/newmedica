'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const hasAttemptedRef = useRef(false);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const passedOrderId = searchParams.get('order_id');
    if (hasAttemptedRef.current) return;
    hasAttemptedRef.current = true;

    const createOrder = async () => {
      setStatus('creating');
      try {
        const token = getAuthToken();
        if (!token) {
          setStatus('error');
          setMessage('You must be logged in to confirm the order.');
          return;
        }
        const res = await fetch(`${API_URL}/api/v1/orders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to create order');
        }
        const data = await res.json();
        setOrderId(data.id || null);
        // Mark order as paid (MVP without webhooks)
        try {
          if (data?.id) {
            await fetch(`${API_URL}/api/v1/orders/${data.id}/mark-paid`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
            });
          }
        } catch {}
        setStatus('success');
        clearCart();
      } catch (e) {
        setStatus('error');
        setMessage('We could not confirm your order. Please contact support if you were charged.');
      }
    };

    // If order_id is provided (non-Stripe path), just show success without creating again
    if (passedOrderId) {
      setOrderId(passedOrderId);
      setStatus('success');
      clearCart();
      return;
    }

    // For Stripe path, we attempt order creation after return regardless of session_id presence
    createOrder();
  }, [searchParams, clearCart]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      {status === 'creating' && (
        <>
          <h1 className="text-2xl font-semibold mb-2">Finalizing your order…</h1>
          <p className="text-gray-600">Please wait a moment.</p>
        </>
      )}
      {status === 'success' && (
        <>
          <h1 className="text-2xl font-semibold mb-2">Thank you! Your order is confirmed.</h1>
          {orderId && <p className="text-gray-600">Order ID: {orderId}</p>}
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link href="/products" className="px-6 py-2 rounded-full bg-black text-white hover:bg-gray-800">Continue Shopping</Link>
            <Link href="/account" className="px-6 py-2 rounded-full border">Go to Account</Link>
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


