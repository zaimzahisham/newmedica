'use client';

import React, { useState, useMemo } from 'react';
import ProductGrid from '@/components/ProductGrid';
import SortDropdown from '@/components/SortDropdown';
import SearchBar from '@/components/SearchBar'; // Import SearchBar
import { products as allProducts } from '@/data/products';

export default function ProductsPage() {
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState(''); // New state for search term

  const filteredAndSortedProducts = useMemo(() => {
    let productsToDisplay = [...allProducts];

    // Apply search filter
    if (searchTerm) {
      productsToDisplay = productsToDisplay.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sort
    switch (sortBy) {
      case 'alphabetical-asc':
        productsToDisplay.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'alphabetical-desc':
        productsToDisplay.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        productsToDisplay.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        productsToDisplay.sort((a, b) => b.price - a.price);
        break;
      case 'date-new-to-old':
        productsToDisplay.sort((a, b) => new Date(b.dateAdded || '').getTime() - new Date(a.dateAdded || '').getTime());
        break;
      case 'date-old-to-new':
        productsToDisplay.sort((a, b) => new Date(a.dateAdded || '').getTime() - new Date(b.dateAdded || '').getTime());
        break;
      default:
        break;
    }
    return productsToDisplay;
  }, [sortBy, searchTerm]); // Add searchTerm to dependencies

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4"> {/* Adjusted margin */}
        <h1 className="text-3xl font-bold text-foreground">All products</h1>
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
        <SortDropdown onSortChange={setSortBy} />
      </div>
      <ProductGrid products={filteredAndSortedProducts} />
    </div>
  );
}