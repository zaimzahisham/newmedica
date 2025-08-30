'use client';

import { useState } from 'react';
import { ProductMedia } from '@/types';
import Image from 'next/image';

interface ProductImageGalleryProps {
  media: ProductMedia[];
}

export default function ProductImageGallery({ media }: ProductImageGalleryProps) {
  // Default to the first image or an empty string if no media is available
  const [selectedImage, setSelectedImage] = useState(media[0]?.url || '');

  // Ensure there's a default image if the array is empty
  if (!media || media.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <span>No Image Available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full h-[450px] overflow-hidden rounded-lg border">
        <Image 
          src={selectedImage} 
          alt="Selected product image" 
          width={450}
          height={450}
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="flex overflow-x-auto space-x-2 pb-2">
        {media.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedImage(item.url)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
              selectedImage === item.url ? 'border-primary' : 'border-transparent'
            }`}
          >
            <Image 
              src={item.url} 
              alt="Product thumbnail" 
              width={80}
              height={80}
              className="w-full h-full object-cover" 
            />
          </button>
        ))}
      </div>
    </div>
  );
}
