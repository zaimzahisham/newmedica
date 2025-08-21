'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, ShoppingCart, ChevronDown } from 'lucide-react';
import { useState, useRef } from 'react';
import Image from 'next/image';

const Navbar = () => {
  const pathname = usePathname();
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navLinkStyles = (path: string) => {
    const isActive = pathname === path;
    return ` transition-colors ${
      isActive ? 'text-primary' : 'text-foreground/70 hover:text-primary'
    }`;
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsCatalogOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsCatalogOpen(false);
    }, 200); // Close after 200ms
  };

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-sm z-50">
      <nav className="container mx-auto px-4 h-20 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image src="/assets/newmedica-logo.png" alt="Newmedica" width={150} height={40} className="object-contain" />
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className={navLinkStyles('/')}>
            Home
          </Link>
          <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <Link href="/products" className="flex items-center gap-1 text-foreground/70 hover:text-primary">
              <span>Catalog</span>
              <ChevronDown size={16} />
            </Link>
            {isCatalogOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-border py-2">
                <Link href="/products/new-arrival" className="block px-4 py-2 text-sm text-foreground/80 hover:bg-gray-100">New arrival</Link>
                <Link href="/products/hot-selling" className="block px-4 py-2 text-sm text-foreground/80 hover:bg-gray-100">Hot selling</Link>
              </div>
            )}
          </div>
          <Link href="/news" className={navLinkStyles('/news')}>
            News
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/account" className="text-foreground/70 hover:text-primary">
            <User size={22} />
          </Link>
          <Link href="/cart" className="text-foreground/70 hover:text-primary">
            <ShoppingCart size={22} />
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
