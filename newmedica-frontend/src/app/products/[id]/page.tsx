import { getProductById, getProducts } from '@/lib/api/products';
import { notFound } from 'next/navigation';
import React from 'react';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductDetails from '@/components/ProductDetails';
import ProductGrid from '@/app/(dashboard)/cart/_components/ProductGrid';

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const product = await getProductById(id).catch(() => null);

  if (!product) {
    notFound();
  }

  // Fetch related products for "You may also like"
  const relatedProducts = await getProducts(product.category.name)
    .then(products => products.filter(p => p.id !== product.id).slice(0, 3))
    .catch(() => []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <ProductImageGallery media={product.media} />
        <ProductDetails product={product} />
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">You may also like</h2>
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </div>
  );
}
