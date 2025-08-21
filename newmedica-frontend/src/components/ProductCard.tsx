import { Product } from '@/types';
import React from 'react';

type ProductCardProps = {
  product: Product;
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-w-16 aspect-h-9 mb-4">
        <img src={`https://picsum.photos/seed/${product.id}/400/225`} alt={product.name} className="object-cover rounded-md" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
      <p className="text-foreground/70 text-sm mb-4 h-10">{product.description}</p>
      <div className="flex justify-between items-center mb-4">
        <span className="text-xl font-bold text-primary">${product.price.toFixed(2)}</span>
        <span className="text-sm text-foreground/70 bg-background px-2 py-1 rounded-full">{product.category}</span>
      </div>
      <div className="flex flex-col space-y-2">
        <a href={product.videoUrl} target="_blank" rel="noopener noreferrer" className="text-center bg-secondary text-white font-semibold py-2 rounded-md hover:bg-opacity-90 transition-colors">
          Watch Video
        </a>
        <a href={product.brochureUrl} download className="text-center bg-border text-foreground py-2 rounded-md hover:bg-border/80 transition-colors">
          Download Brochure
        </a>
        <button className="bg-accent text-white font-semibold py-2 rounded-md hover:bg-opacity-90 transition-colors">
          Checkout
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
