'use client';

import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore'; // Import useAuthStore
import CartItem from './_components/CartItem';
import { EmptyCartDisplay } from './_components/EmptyCart';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function CartView() {
  const cart = useCartStore((state) => state.cart);
  const isLoading = useCartStore((state) => state.isLoading);
  const { user, loading: authLoading } = useAuthStore(); // Get user and authLoading state

  // If auth is still loading, show a general loading state
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-serif mb-6">Your Cart</h1>
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    );
  }

  // If no user is logged in, prompt them to log in
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-serif mb-6">Your Cart</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Please <Link href="/login" className="text-primary hover:underline">log in</Link> to view your cart.
        </p>
        <Link href="/login" passHref>
          <button className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors">
            Log In
          </button>
        </Link>
      </div>
    );
  }

  // Existing logic for logged-in users
  if (isLoading || !cart) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-serif mb-6">Your Cart</h1>
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    );
  }

  const sortedItems = [...cart.items].sort((a, b) => a.product.name.localeCompare(b.product.name));

  if (cart.items.length === 0) {
    return <EmptyCartDisplay />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-serif">Your Cart</h1>
        <Link href="/products" passHref>
          <button className="underline hover:no-underline">
            Continue shopping
          </button>
        </Link>
      </div>

      {/* Cart Headers */}
      <div className="grid grid-cols-5 gap-4 pb-2 border-b text-sm uppercase text-muted-foreground">
        <div className="col-span-2">Product</div>
        <div className="col-span-1 text-center">Quantity</div>
        <div className="col-span-1 text-right">Total</div>
        <div className="col-span-1"></div>
      </div>

      {/* Cart Items */}
      <div className="border-b">
        {sortedItems.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>

      {/* Cart Footer */}
      <div className="flex flex-col items-end mt-6">
        <div className="text-lg font-semibold">
          <span>Subtotal</span>
          <span className="ml-4">RM{cart.total_price.toFixed(2)}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Shipping, taxes, and discounts will be calculated at checkout.
        </p>
        <Link href="/checkout" passHref>
          <button className="mt-4 bg-black text-white px-12 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors">
            Checkout
          </button>
        </Link>
      </div>
    </div>
  );
}
