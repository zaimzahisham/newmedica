import ProductCategoryPage from './ProductCategoryPage';

type ProductsPageProps = {
  params: { category: string };
};

export default function ProductsPage({ params }: ProductsPageProps) {
  return <ProductCategoryPage category={params.category} />;
}