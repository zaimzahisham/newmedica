'use client';

import Link from 'next/link';

export default function OrderCancelPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      <h1 className="text-2xl font-semibold mb-2">Checkout canceled</h1>
      <p className="text-gray-600">Your payment was not completed. You can try again or review your cart.</p>
      <div className="mt-6 flex items-center justify-center gap-4">
        <Link href="/cart" className="px-6 py-2 rounded-full border">Back to Cart</Link>
        <Link href="/products" className="px-6 py-2 rounded-full bg-black text-white hover:bg-gray-800">Continue Shopping</Link>
      </div>
    </div>
  );
}


