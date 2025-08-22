'use client';

import { Product } from '@/types';
import { Check, X } from 'lucide-react';
import Link from 'next/link';

interface AddToCartConfirmationProps {
  product: Product;
  quantity: number;
  onClose: () => void;
}

export default function AddToCartConfirmation({ product, quantity, onClose }: AddToCartConfirmationProps) {
  return (
    <div className="fixed top-8 right-8 w-96 bg-white border rounded-lg shadow-lg z-50 animate-in fade-in-0 slide-in-from-top-5">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Check size={20} className="text-green-500" />
          <h3 className="font-semibold text-foreground">Added to cart</h3>
          <button onClick={onClose} className="ml-auto text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <img 
            src={product.media[0]?.url} 
            alt={product.name} 
            className="w-16 h-16 rounded-md object-cover border" 
          />
          <div>
            <p className="font-medium text-foreground">{product.name}</p>
            <p className="text-sm text-muted-foreground">Quantity: {quantity}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Link 
            href="/cart" 
            className="w-full text-center border border-border py-2 rounded-md hover:bg-secondary"
          >
            View cart ({quantity})
          </Link>
          <Link 
            href="/checkout" 
            className="w-full text-center bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90"
          >
            Checkout
          </Link>
          <button 
            onClick={onClose} 
            className="text-sm text-muted-foreground hover:text-foreground mt-2 underline"
          >
            Continue shopping
          </button>
        </div>
      </div>
    </div>
  );
}
