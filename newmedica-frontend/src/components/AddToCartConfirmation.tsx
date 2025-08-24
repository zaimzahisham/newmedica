'use client';

import { Product } from '@/types';
import { Check, X } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';

interface AddToCartConfirmationProps {
  product: Product;
  quantity: number;
  onClose: () => void;
}

const modalVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function AddToCartConfirmation({ product, quantity, onClose }: AddToCartConfirmationProps) {
  const cart = useCartStore((state) => state.cart);
  const cartItemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <motion.div 
      className="fixed top-8 right-8 w-96 bg-white border rounded-lg shadow-lg z-50"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={modalVariants}
      transition={{ duration: 0.3 }}
    >
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
            View cart ({cartItemCount})
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
    </motion.div>
  );
}
