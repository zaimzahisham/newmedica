'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import SortDropdown from '@/components/SortDropdown';
import SearchBar from '@/components/SearchBar';

export default function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || '');

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    if (sortBy) {
      params.set('sort_by', sortBy);
    } else {
      params.delete('sort_by');
    }
    
    // Debounce the router push
    const handler = setTimeout(() => {
      router.replace(`${pathname}?${params.toString()}`);
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, sortBy, pathname, router, searchParams]);

  return (
    <div className="flex items-center gap-4">
      <SearchBar value={searchTerm} onChange={setSearchTerm} />
      <SortDropdown onSortChange={setSortBy} />
    </div>
  );
}
