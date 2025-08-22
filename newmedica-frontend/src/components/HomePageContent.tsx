import React from 'react';
import ProductCarousel from '@/components/ProductCarousel';
import { getProducts } from '@/lib/api/products';
import { Product } from '@/types';

export default async function HomePageContent() {
  const products: Product[] = await getProducts();
  // In the future, you might want an endpoint for "featured" products
  const featuredProducts = products.slice(0, 8);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
      <ProductCarousel products={featuredProducts} />
    </div>
  );
}
