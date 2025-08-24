import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      <ShoppingCart className="w-24 h-24 text-muted-foreground" />
      <h2 className="mt-6 text-2xl font-semibold">Your cart is empty</h2>
      <p className="mt-2 text-muted-foreground">
        Looks like you haven't added anything to your cart yet.
      </p>
      <Link href="/products" className="mt-6">
        <button className="btn btn-primary">Start Shopping</button>
      </Link>
    </div>
  );
}