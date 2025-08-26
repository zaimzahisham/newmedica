'use client';

import { useState, useEffect } from 'react';
import QuantitySelector from './QuantitySelector';
import { Product } from '@/types';
import { Globe, ShieldCheck, Gem, Share2, FileText } from 'lucide-react';
import AddToCartConfirmation from './AddToCartConfirmation';
import DOMPurify from 'dompurify';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import RequestQuotationModal from './RequestQuotationModal';
import { AnimatePresence } from 'framer-motion';

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [sanitizedDescription, setSanitizedDescription] = useState('');

  const { user, loading: authLoading } = useAuthStore(); // Get user and authLoading state
  const addItemToCart = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSanitizedDescription(DOMPurify.sanitize(product.description));
    }
  }, [product.description]);

  const handleAddToCart = async () => {
    if (authLoading) return; // Do nothing if auth state is still loading

    if (!user) {
      alert('Please log in to add items to your cart.');
      return;
    }

    if (!product || !product.id) return;
    await addItemToCart({ product_id: product.id, quantity });
    setShowConfirmation(true);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
  };

  const isSpecialUser = user && (user.userType === 'Agent' || user.userType === 'Healthcare');

  return (
    <>
      <AnimatePresence>
        {showConfirmation && (
          <AddToCartConfirmation 
            product={product} 
            quantity={quantity} 
            onClose={handleCloseConfirmation} 
          />
        )}
        {isSpecialUser && showQuotationModal && user && (
          <RequestQuotationModal
            product={product}
            user={user}
            onClose={() => setShowQuotationModal(false)}
          />
        )}
      </AnimatePresence>
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
                disabled={isLoading}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
            <div className="flex items-center gap-4">
              {isSpecialUser && (
                <button 
                  onClick={() => setShowQuotationModal(true)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <FileText size={16} />
                  <span>Request Quotation</span>
                </button>
              )}
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Share2 size={16} />
                <span>Share</span>
              </button>
            </div>
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
