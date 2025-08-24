'use client';

import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { CartItem as ICartItem } from '@/types';
import QuantitySelector from '@/components/QuantitySelector';
import { useState } from 'react';
import debounce from 'lodash/debounce';

interface CartItemProps {
  item: ICartItem;
}

export default function CartItem({ item }: CartItemProps) {
  const { removeItem, updateItemQuantity, isLoading } = useCartStore();
  const [quantity, setQuantity] = useState(item.quantity);

  const debouncedUpdate = debounce((newQuantity: number) => {
    if (newQuantity > 0) {
      updateItemQuantity(item.id, { quantity: newQuantity });
    }
  }, 500);

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    debouncedUpdate(newQuantity);
  };

  return (
    <div className="grid grid-cols-5 items-center gap-4 py-4 border-b">
      {/* Product */}
      <div className="col-span-2 flex items-center space-x-4">
        <Image
          src={item.product.media[0]?.url || '/placeholder.svg'}
          alt={item.product.name}
          width={80}
          height={80}
          className="rounded-md object-cover"
        />
        <div>
          <h3 className="font-semibold">{item.product.name}</h3>
          <p className="text-sm text-muted-foreground">
            RM{item.product.price.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Quantity */}
      <div className="col-span-1 flex justify-center">
        <QuantitySelector quantity={quantity} setQuantity={handleQuantityChange} />
      </div>

      {/* Total */}
      <div className="col-span-1 text-right">
        <p className="font-semibold">
          RM{(item.product.price * quantity).toFixed(2)}
        </p>
      </div>

      {/* Remove */}
      <div className="col-span-1 text-right">
        <button 
          onClick={() => removeItem(item.id)} 
          disabled={isLoading}
          className="text-muted-foreground hover:text-destructive disabled:opacity-50"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}
