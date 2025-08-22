'use client';

import { Product } from '@/types';
import Link from 'next/link';
import React, { useState } from 'react';

type ProductCardProps = {
  product: Product;
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const fallbackImage = `https://picsum.photos/seed/${product.id}/400/300`;

  const primaryImage = product.media?.[0]?.url || fallbackImage;
  const secondaryImage = product.media?.[1]?.url || primaryImage;

  return (
    <Link 
      href={`/products/${product.id}`}
      className="group block p-3 border rounded-lg border-transparent transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="overflow-hidden rounded-lg">
        <img 
          src={isHovered ? secondaryImage : primaryImage} 
          alt={product.name} 
          className="w-full h-auto object-cover aspect-[1/1] group-hover:scale-105 transition-transform duration-300" 
        />
      </div>
      <div className="mt-5 text-center">
        <h3 className="text-xl font-semibold text-foreground">{product.name}</h3>
        <p className="text-foreground/80 text-lg mt-2">RM{product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
