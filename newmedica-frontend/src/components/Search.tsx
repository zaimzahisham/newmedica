'use client';

import React from 'react';

type SearchProps = {
  value: string;
  onSearch: (searchTerm: string) => void;
};

const Search: React.FC<SearchProps> = ({ value, onSearch }) => {
  return (
    <input
      type="text"
      placeholder="Search by name..."
      value={value}
      onChange={(e) => onSearch(e.target.value)}
      className="w-full p-2 h-8 bg-card border border-border rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow"
    />
  );
};

export default Search;
