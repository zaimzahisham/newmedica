'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CategoryFilterProps = {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
};

const VISIBLE_CATEGORIES = 5;

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selectedCategory, onSelectCategory }) => {
  const [currentIndex, setCurrentIndex] = useState(VISIBLE_CATEGORIES);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const totalCategories = categories.length;
  const hasClones = totalCategories > VISIBLE_CATEGORIES;

  // We only need to clone if there are more categories than visible space
  const allItems = hasClones 
    ? [...categories.slice(-VISIBLE_CATEGORIES), ...categories, ...categories.slice(0, VISIBLE_CATEGORIES)] 
    : categories;

  const handlePrev = () => {
    if (!isTransitioning && hasClones) return;
    setCurrentIndex(prevIndex => prevIndex - 1);
  };

  const handleNext = () => {
    if (!isTransitioning && hasClones) return;
    setCurrentIndex(prevIndex => prevIndex + 1);
  };

  useEffect(() => {
    if (!hasClones) return;

    // After the transition to a cloned slide, we jump back to the real one
    if (currentIndex < VISIBLE_CATEGORIES || currentIndex >= VISIBLE_CATEGORIES + totalCategories) {
      timeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(prevIndex => (prevIndex % totalCategories) + totalCategories);
      }, 500); // This duration must match the CSS transition duration
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, totalCategories, hasClones]);

  // Re-enable transitions after the instant jump
  useEffect(() => {
    if (!isTransitioning) {
      const timer = setTimeout(() => setIsTransitioning(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const buttonStyles = "w-32 h-11 flex-shrink-0 flex items-center justify-center px-4 py-2 rounded-full font-semibold text-sm transition-colors duration-200 truncate";
  const activeStyles = "bg-primary text-white shadow-md";
  const inactiveStyles = "bg-card text-foreground/70 hover:bg-border hover:text-foreground";

  // Each button is w-32 (8rem) and the gap is gap-2 (0.5rem). Total width per item is 8.5rem.
  const offset = `-${currentIndex * 8.5}rem`;

  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      <button
        onClick={() => onSelectCategory('')}
        className={`${buttonStyles} ${selectedCategory === '' ? activeStyles : inactiveStyles}`}
      >
        All
      </button>

      <div className="flex-shrink-0 w-[42.5rem] overflow-hidden"> {/* 5 * 8.5rem */}
        <div
          className={`flex items-center gap-2 ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
          style={{ transform: `translateX(${offset})` }}
        >
          {allItems.map((category, index) => (
            <button
              key={`${category}-${index}`}
              onClick={() => onSelectCategory(category)}
              className={`${buttonStyles} ${selectedCategory === category ? activeStyles : inactiveStyles}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {hasClones && (
        <div className="flex items-center gap-1">
          <button onClick={handlePrev} className="p-2 rounded-full bg-card border border-border hover:bg-border/80">
            <ChevronLeft size={16} />
          </button>
          <button onClick={handleNext} className="p-2 rounded-full bg-card border border-border hover:bg-border/80">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
