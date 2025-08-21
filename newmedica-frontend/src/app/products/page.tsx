import { Suspense } from 'react';
import ProductsPageContent from './ProductsPageContent';

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading products...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
