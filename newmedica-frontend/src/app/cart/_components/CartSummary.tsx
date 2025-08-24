'use client';

import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';

export default function CartSummary() {
  const items = useCartStore((state) => state.items);
  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08; // Example 8% tax
  const total = subtotal + tax;

  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      <Link href="/checkout" className="mt-6 block">
        <button className="btn btn-primary w-full">Proceed to Checkout</button>
      </Link>
    </div>
  );
}