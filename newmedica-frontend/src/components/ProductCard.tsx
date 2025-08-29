'use client';

import { Product } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { showWarningAlert, showSuccessToast } from './CustomAlert'; // Import CustomAlert functions

type ProductCardProps = {
  product: Product;
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const fallbackImage = `https://picsum.photos/seed/${product.id}/400/300`;

  const primaryImage = product.media?.[0]?.url || fallbackImage;
  const secondaryImage = product.media?.[1]?.url || primaryImage;

  const { user, loading: authLoading } = useAuthStore();
  const addItemToCart = useCartStore((state) => state.addItem);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (authLoading) return;

    if (!user) {
      showWarningAlert('Please log in to add items to your cart.');
      return;
    }

    if (!product || !product.id) return;

    await addItemToCart({ product_id: product.id, quantity: 1 });
    showSuccessToast(`${product.name} has been added to your cart.`);
  };

  return (
    <Link 
      href={`/products/${product.id}`}
      className="group block p-3 border rounded-lg border-transparent transition-all duration-300 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="overflow-hidden rounded-lg">
        <Image 
          src={isHovered ? secondaryImage : primaryImage} 
          alt={product.name} 
          width={300}
          height={300}
          className="w-full h-auto object-cover aspect-[1/1] group-hover:scale-105 transition-transform duration-300" 
        /> 
      </div>
      <div className="mt-5 text-center">
        <h3 className="text-xl font-semibold text-foreground">{product.name}</h3>
        <p className="text-foreground/80 text-lg mt-2">RM{product.price.toFixed(2)}</p>
      </div>
      {isHovered && user && (
        <button 
          onClick={handleAddToCart}
          className="absolute top-5 right-5 bg-black text-white p-2 rounded-full shadow-lg hover:bg-gray-800 transition-colors border border-black"
          aria-label="Add to cart"
        >
          <Plus size={20} />
        </button>
      )}
    </Link>
  );
};

export default ProductCard;
