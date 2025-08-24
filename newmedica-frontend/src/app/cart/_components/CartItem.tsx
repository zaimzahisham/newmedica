'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types';

interface CartItemProps {
  item: Product & { quantity: number };
}

export default function CartItem({ item }: CartItemProps) {
  const { removeItem, updateItemQuantity } = useCartStore();

  return (
    <div className="flex items-center justify-between py-4 border-b">
      <div className="flex items-center space-x-4">
        <Image
          src={item.media[0]?.url || '/placeholder.svg'}
          alt={item.name}
          width={80}
          height={80}
          className="rounded-md"
        />
        <div>
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-sm text-muted-foreground">
            ${item.price.toFixed(2)}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value))}
          className="w-16 text-center border rounded-md"
        />
        <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive">
          <X size={20} />
        </button>
      </div>
    </div>
  );
}