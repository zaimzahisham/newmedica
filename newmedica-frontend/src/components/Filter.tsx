'use client';

import React from 'react';

type SortFilterProps = {
  onSortChange: (value: string) => void;
};

const SortFilter: React.FC<SortFilterProps> = ({ onSortChange }) => {
  const selectStyles = "w-full sm:w-auto p-2 h-8 bg-card border border-border rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow";

  return (
    <select
      onChange={(e) => onSortChange(e.target.value)}
      className={selectStyles}
    >
      <option value="">Sort by Price</option>
      <option value="asc">Price: Low to High</option>
      <option value="desc">Price: High to Low</option>
    </select>
  );
};

export default SortFilter;
