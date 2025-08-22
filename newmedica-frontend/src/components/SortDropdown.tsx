'use client';

import React from 'react';

type SortDropdownProps = {
  onSortChange: (value: string) => void;
};

const SortDropdown: React.FC<SortDropdownProps> = ({ onSortChange }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-foreground/80 text-nowrap">Sort by:</span>
      <select
        onChange={(e) => onSortChange(e.target.value)}
        className="p-2 border border-border rounded-md bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        <option value="featured">Featured</option>
        <option value="alphabetical-asc">Alphabetically, A-Z</option>
        <option value="alphabetical-desc">Alphabetically, Z-A</option>
        <option value="price-asc">Price, low to high</option>
        <option value="price-desc">Price, high to low</option>
        <option value="date-new-to-old">Date, new to old</option>
        <option value="date-old-to-new">Date, old to new</option>
      </select>
    </div>
  );
};

export default SortDropdown;