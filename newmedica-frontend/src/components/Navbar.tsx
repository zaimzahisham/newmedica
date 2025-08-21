'use client';

import Link from 'next/link';
import ThemeToggleButton from './ThemeToggleButton';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();

  const navLinkStyles = (path: string) => {
    const isActive = pathname === path;
    return `font-semibold transition-colors ${
      isActive ? 'text-primary' : 'text-foreground/70 hover:text-primary'
    }`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b border-border z-50">
      <nav className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          Newmedica
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/products" className={navLinkStyles('/products')}>
            Products
          </Link>
          <ThemeToggleButton />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
