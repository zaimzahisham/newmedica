'use client';

import { useState } from 'react';
import QuantitySelector from './QuantitySelector';
import { Product } from '@/types';
import { Globe, ShieldCheck, Gem, Share2 } from 'lucide-react';
import AddToCartConfirmation from './AddToCartConfirmation';
import DOMPurify from 'dompurify';
import { useAuthStore } from '@/store/authStore';

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const user = useAuthStore((state) => state.user); // Get user from authStore

  const handleAddToCart = () => {
    // TODO: Implement actual add to cart logic in Phase 2
    console.log(`Added ${quantity} of ${product.name} to cart!`);
    setShowConfirmation(true);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
  };

  // Sanitize the HTML description only once, when the component renders
  const sanitizedDescription = DOMPurify.sanitize(product.description);

  const isSpecialUser = user && user.userType && (user.userType === 'Agent' || user.userType === 'Healthcare');

  return (
    <>
      {showConfirmation && (
        <AddToCartConfirmation 
          product={product} 
          quantity={quantity} 
          onClose={handleCloseConfirmation} 
        />
      )}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
        <p className="text-2xl font-semibold text-primary">RM{product.price.toFixed(2)}</p>
        
        <div className="flex flex-col gap-2 text-sm text-muted-foreground border-y py-4">
          <div className="flex items-center gap-2">
            <Globe size={16} />
            <span>Worldwide shipping</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>Secure payments</span>
          </div>
          <div className="flex items-center gap-2">
            <Gem size={16} />
            <span>Authentic products</span>
          </div>
        </div>

        {isSpecialUser && (
          <div className="p-4 bg-secondary/50 rounded-lg">
            <h3 className="font-semibold mb-2">Promotions</h3>
            <p className="text-sm text-muted-foreground">{user.userType.toUpperCase()} PRICE</p>
          </div>
        )}

        <div>
          <span className="text-sm font-medium mb-2 block">Quantity</span>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
              <button 
                onClick={handleAddToCart}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Add to Cart
              </button>
            </div>
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
        </div>

        <div 
          className="prose dark:prose-invert max-w-none mt-4"
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }} 
        />
      </div>
    </>
  );
}
