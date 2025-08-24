'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { getAuthToken } from '@/lib/utils';

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const { fetchCart } = useCartStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const token = getAuthToken();
    if (user && token) {
      fetchCart();
    }
  }, [user, fetchCart]);

  return <>{children}</>;
}
