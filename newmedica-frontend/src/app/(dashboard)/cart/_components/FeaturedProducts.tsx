import { getProducts } from '@/lib/api/products';
import ProductGrid from './ProductGrid';

export default async function FeaturedProducts() {
  const featuredProducts = await getProducts('Hot Selling')
    .then(products => products.slice(0, 3))
    .catch(() => []);

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-secondary/30 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-serif text-center mb-8">Feature on homepage</h2>
        <ProductGrid products={featuredProducts} />
      </div>
    </div>
  );
}
