'use client';

import React from 'react';
import ProductCarousel from '@/components/ProductCarousel';
import { products } from '@/data/products';

export default function HomePageContent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ProductCarousel products={products} />
    </div>
  );
}
