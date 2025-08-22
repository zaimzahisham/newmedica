'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductGrid from '@/components/ProductGrid';
import { getProducts } from '@/lib/api/products';
import { Product } from '@/types';
import ProductFilters from '@/components/ProductFilters';
import { Skeleton } from '@/components/ui/skeleton';

type ProductsPageProps = {
  params: { category: string };
};

function ProductList({ category }: { category: string }) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const search = searchParams.get('search') || undefined;
      const sortBy = searchParams.get('sort_by') || undefined;
      try {
        const fetchedProducts = await getProducts(category, search, sortBy);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams, category]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
      </div>
    );
  }

  return <ProductGrid products={products} />;
}

export default function ProductsPage({ params }: ProductsPageProps) {
  const pageTitle = params.category ? `${params.category.replace('-', ' ')}` : 'All Products';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-foreground capitalize text-nowrap pr-4">
          {pageTitle}
        </h1>
        <ProductFilters />
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <ProductList category={params.category} />
      </Suspense>
    </div>
  );
}