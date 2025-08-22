'use client';

import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
}

export default function QuantitySelector({ quantity, setQuantity }: QuantitySelectorProps) {
  const increment = () => setQuantity(quantity + 1);
  const decrement = () => setQuantity(Math.max(1, quantity - 1));

  return (
    <div className="flex items-center border rounded-md">
      <button onClick={decrement} className="px-3 py-2 text-muted-foreground">
        <Minus size={16} />
      </button>
      <span className="px-4 py-2 font-semibold">{quantity}</span>
      <button onClick={increment} className="px-3 py-2 text-muted-foreground">
        <Plus size={16} />
      </button>
    </div>
  );
}
