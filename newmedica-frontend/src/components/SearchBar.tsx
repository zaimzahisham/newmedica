'use client';

import React from 'react';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = "Search products..." }) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-1/2 p-2 border-b border-gray-500 bg-card text-foreground focus:outline-none focus:border-black"
    />
  );
};

export default SearchBar;