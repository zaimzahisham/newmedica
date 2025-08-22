'use client';

import { useState } from 'react';
import QuantitySelector from './QuantitySelector';
import { Product } from '@/types';

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    // TODO: Implement actual add to cart logic in Phase 2
    alert(`Added ${quantity} of ${product.name} to cart!`);
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-foreground mb-4">{product.name}</h1>
      <p className="text-2xl text-primary mb-6">RM{product.price.toFixed(2)}</p>
      
      <div className="prose dark:prose-invert max-w-none mb-6">
        <p>{product.description}</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
        <button 
          onClick={handleAddToCart}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold flex-grow"
        >
          Add to Cart
        </button>
      </div>

      <div className="mt-6 text-sm text-muted-foreground">
        <p>Category: {product.category.name}</p>
        <p>Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}</p>
      </div>
    </div>
  );
}
