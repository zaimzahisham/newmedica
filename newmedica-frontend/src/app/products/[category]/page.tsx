'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import ProductGrid from '@/components/ProductGrid';
import SortDropdown from '@/components/SortDropdown';
import SearchBar from '@/components/SearchBar'; // Import SearchBar
import { products as allProducts } from '@/data/products';

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState(''); // New state for search term

  const filteredAndSortedProducts = useMemo(() => {
    let productsToFilter = [...allProducts];

    // Apply category filter
    if (category === 'new-arrival') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      productsToFilter = productsToFilter.filter(p => {
        if (p.dateAdded) {
          return new Date(p.dateAdded) >= thirtyDaysAgo;
        }
        return false;
      });
    } else {
      productsToFilter = productsToFilter.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // Apply search filter
    if (searchTerm) {
      productsToFilter = productsToFilter.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    let sorted = [...productsToFilter];

    // Apply sort
    switch (sortBy) {
      case 'alphabetical-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'alphabetical-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'date-new-to-old':
        sorted.sort((a, b) => new Date(b.dateAdded || '').getTime() - new Date(a.dateAdded || '').getTime());
        break;
      case 'date-old-to-new':
        sorted.sort((a, b) => new Date(a.dateAdded || '').getTime() - new Date(b.dateAdded || '').getTime());
        break;
      default:
        break;
    }
    return sorted;
  }, [category, sortBy, searchTerm]); // Add searchTerm to dependencies

  const displayCategoryName = category.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4"> {/* Adjusted margin */}
        <h1 className="text-3xl font-bold text-foreground">{displayCategoryName}</h1>
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
        <SortDropdown onSortChange={setSortBy} />
      </div>
      <ProductGrid products={filteredAndSortedProducts} />
    </div>
  );
}