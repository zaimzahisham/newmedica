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
import { showWarningAlert } from './CustomAlert'; // Import CustomAlert

interface VoucherResponse {
  id: string;
  code: string;
  discount_type: string;
  amount: number;
  min_quantity: number;
  per_unit: boolean;
}

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [sanitizedDescription, setSanitizedDescription] = useState('');
  const [vouchers, setVouchers] = useState<VoucherResponse[]>([]);
  const [vouchersLoading, setVouchersLoading] = useState(true);

  const { user, loading: authLoading, token } = useAuthStore(); // Get user, authLoading, and token state
  const addItemToCart = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSanitizedDescription(DOMPurify.sanitize(product.description));
    }

    const fetchVouchers = async () => {
      console.log("Fetching vouchers for:", { productId: product?.id, userId: user?.id, token: token ? "present" : "absent" });
      if (!product?.id || !user?.id || !token) {
        setVouchers([]);
        setVouchersLoading(false);
        return;
      }

      setVouchersLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/products/${product.id}/vouchers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data: VoucherResponse[] = await response.json();
          setVouchers(data);
        } else {
          console.error('Failed to fetch vouchers', response.statusText);
          setVouchers([]);
        }
      } catch (error) {
        console.error('Error fetching vouchers:', error);
        setVouchers([]);
      } finally {
        setVouchersLoading(false);
      }
    };

    fetchVouchers();
  }, [product.id, user?.id, token, product.description]);

  const handleAddToCart = async () => {
    if (authLoading) return; // Do nothing if auth state is still loading

    if (!user) {
      showWarningAlert('Please log in to add items to your cart.');
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

  const getVoucherDetails = (voucher: VoucherResponse): string => {
    let discountDescription = '';

    if (voucher.discount_type === 'fixed') {
      discountDescription = `RM${voucher.amount.toFixed(2)} OFF`; // Uppercase OFF
      if (voucher.per_unit) {
        discountDescription += ` PER UNIT`; // Uppercase PER UNIT
      }
    } else if (voucher.discount_type === 'percent') {
      discountDescription = `${voucher.amount}% OFF`; // Uppercase OFF
    }

    if (voucher.min_quantity > 0) {
        discountDescription += ` FOR PURCHASE OF AT LEAST ${voucher.min_quantity} UNIT${voucher.min_quantity > 1 ? 'S' : ''}`; 
    }
    return discountDescription;
  };

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

        {(isSpecialUser || (vouchers.length > 0 && !vouchersLoading)) && (
          <div className="p-4 bg-secondary/50 rounded-lg">
            <h3 className="font-semibold mb-2">Promotions For You, Our {user?.userType == "Healthcare" ? user.userType + " Professionals" : "Agents"}</h3>
            {vouchersLoading ? (
              <p className="text-sm text-muted-foreground">Loading promotions...</p>
            ) : vouchers.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {vouchers.map((voucher) => (
                  <li key={voucher.id}>
                    <span className="font-medium">{getVoucherDetails(voucher)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No special promotions available.</p>
            )}
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
