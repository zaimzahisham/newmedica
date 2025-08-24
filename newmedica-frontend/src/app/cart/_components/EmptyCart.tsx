import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export function EmptyCartDisplay() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center text-center">
      <ShoppingCart size={64} className="text-muted-foreground mb-6" />
      <h1 className="text-4xl font-serif mb-4">Your cart is currently empty.</h1>
      <Link href="/products" passHref>
        <button className="mt-4 bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors">
          Continue shopping
        </button>
      </Link>
    </div>
  );
}
