'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductGrid from '@/components/ProductGrid';
import { getProducts } from '@/lib/api/products';
import { Product } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductList() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const search = searchParams.get('search') || undefined;
      const sortBy = searchParams.get('sort_by') || undefined;
      try {
        const fetchedProducts = await getProducts(undefined, search, sortBy);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        // Optionally, set an error state to show in the UI
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
      </div>
    );
  }

  return <ProductGrid products={products} />;
}
