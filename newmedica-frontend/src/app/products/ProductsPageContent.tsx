'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import ProductList from '@/components/ProductList';
import Search from '@/components/Search';
import SortFilter from '@/components/Filter';
import CategoryFilter from '@/components/CategoryFilter';
import { products } from '@/data/products';

export default function ProductsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('');
  const [priceSort, setPriceSort] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchTerm) {
        params.set('search', searchTerm);
      } else {
        params.delete('search');
      }
      router.replace(`${pathname}?${params.toString()}`);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, pathname, router, searchParams]);

  const categories = useMemo(() => {
    const allCategories = products.map((p) => p.category);
    return [...new Set(allCategories)];
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleSortChange = (value: string) => {
    setPriceSort(value);
  };

  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (priceSort) {
      filtered.sort((a, b) => {
        if (priceSort === 'asc') {
          return a.price - b.price;
        } else {
          return b.price - a.price;
        }
      });
    }

    return filtered;
  }, [searchTerm, category, priceSort]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="relative text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-primary">Our Products</h1>
        <p className="text-lg text-foreground/80 mt-2">
          Browse our catalog of high-quality medical equipment.
        </p>
      </header>

      <CategoryFilter 
        categories={categories} 
        selectedCategory={category} 
        onSelectCategory={handleCategorySelect} 
      />

      <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">
          {category || 'All'} Products
        </h2>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex-grow md:flex-grow-0">
            <Search value={searchTerm} onSearch={handleSearch} />
          </div>
          <SortFilter onSortChange={handleSortChange} />
        </div>
      </div>

      <ProductList products={filteredProducts} />
    </div>
  );
}
