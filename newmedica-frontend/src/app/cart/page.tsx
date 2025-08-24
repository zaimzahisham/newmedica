'use client';

import { useCartStore } from '@/store/cartStore';
import CartItem from './_components/CartItem';
import CartSummary from './_components/CartSummary';
import EmptyCart from './_components/EmptyCart';

export default function CartPage() {
  const items = useCartStore((state) => state.items);

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>
        <div>
          <CartSummary />
        </div>
      </div>
    </div>
  );
}