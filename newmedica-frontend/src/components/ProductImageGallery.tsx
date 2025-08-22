'use client';

import { useState } from 'react';
import { ProductMedia } from '@/types';

interface ProductImageGalleryProps {
  media: ProductMedia[];
}

export default function ProductImageGallery({ media }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(media[0]?.url || '');

  return (
    <div>
      <div className="mb-4">
        <img src={selectedImage} alt="Selected product image" className="w-full rounded-lg" />
      </div>
      <div className="flex space-x-2">
        {media.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedImage(item.url)}
            className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
              selectedImage === item.url ? 'border-primary' : 'border-transparent'
            }`}
          >
            <img src={item.url} alt="Product thumbnail" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
