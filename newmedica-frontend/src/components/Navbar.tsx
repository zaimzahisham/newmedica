'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, ShoppingCart, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const Navbar = () => {
  const pathname = usePathname();
  const { user, logout, checkAuth } = useAuthStore();
  const { items: cartItems, fetchCart } = useCartStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    checkAuth();
    fetchCart();
  }, [checkAuth, fetchCart]);

  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const catalogTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navLinkStyles = (path: string) => {
    const isActive = pathname === path;
    return ` transition-colors ${
      isActive ? 'text-primary' : 'text-foreground/70 hover:text-primary'
    }`;
  };

  const handleCatalogMouseEnter = () => {
    if (catalogTimeoutRef.current) {
      clearTimeout(catalogTimeoutRef.current);
    }
    setIsCatalogOpen(true);
  };

  const handleCatalogMouseLeave = () => {
    catalogTimeoutRef.current = setTimeout(() => {
      setIsCatalogOpen(false);
    }, 200);
  };

  const handleUserMouseEnter = () => {
    if (userTimeoutRef.current) {
      clearTimeout(userTimeoutRef.current);
    }
    setIsUserDropdownOpen(true);
  };

  const handleUserMouseLeave = () => {
    userTimeoutRef.current = setTimeout(() => {
      setIsUserDropdownOpen(false);
    }, 200);
  };

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 backdrop-blur-sm z-50">
      <nav className="container mx-auto px-4 h-20 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image src="/assets/newmedica-logo.png" alt="Newmedica" width={150} height={40} className="object-contain" />
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className={navLinkStyles('/')}>
            Home
          </Link>
          <div className="relative" onMouseEnter={handleCatalogMouseEnter} onMouseLeave={handleCatalogMouseLeave}>
            <Link href="/products" className="flex items-center gap-1 text-foreground/70 hover:text-primary">
              <span>Catalog</span>
              <ChevronDown size={16} />
            </Link>
            {isCatalogOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-border py-2">
                <Link href="/products/category/new-arrival" className="block px-4 py-2 text-sm text-foreground/80 hover:bg-gray-100">New arrival</Link>
                <Link href="/products/category/hot-selling" className="block px-4 py-2 text-sm text-foreground/80 hover:bg-gray-100">Hot selling</Link>
              </div>
            )}
          </div>
          <Link href="/news" className={navLinkStyles('/news')}>
            News
          </Link>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <div className="relative" onMouseEnter={handleUserMouseEnter} onMouseLeave={handleUserMouseLeave}>
              <Link href="/account" className="text-foreground/70 hover:text-primary">
                <User size={22} />
              </Link>
              {isUserDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-border py-2">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-semibold">{user.firstName}</p>
                    <p className="text-xs text-gray-500">{user.userType}</p>
                  </div>
                  <Link href="/account" className="block px-4 py-2 text-sm text-foreground/80 hover:bg-gray-100">My Account</Link>
                  <Link href="/account/address" className="block px-4 py-2 text-sm text-foreground/80 hover:bg-gray-100">Address Book</Link>
                  <Link href="#" className="block px-4 py-2 text-sm text-foreground/80 hover:bg-gray-100">Order History</Link>
                  <Link href="#" className="block px-4 py-2 text-sm text-foreground/80 hover:bg-gray-100">Vouchers</Link>
                  <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-foreground/80 hover:bg-gray-100">Log out</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="text-foreground/70 hover:text-primary">
              <User size={22} />
            </Link>
          )}
          <Link href="/cart" className="relative text-foreground/70 hover:text-primary">
            <ShoppingCart size={22} />
            {isClient && cartItemCount > 0 && (
              <span className="absolute bg-primary  text-primary-foreground text-xs rounded-full h-3 w-6.5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
