import React, { Suspense } from 'react';
import ProductFilters from './_components/ProductFilters';
import ProductList from './ProductList';

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-foreground text-nowrap pr-4">All Products</h1>
        <Suspense fallback={<div>Loading filters...</div>}>
          <ProductFilters />
        </Suspense>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <ProductList />
      </Suspense>
    </div>
  );
}