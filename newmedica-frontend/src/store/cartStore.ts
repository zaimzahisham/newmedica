import { create } from 'zustand';
import { Product, Cart, CartItem as ICartItem, CartItemCreate, CartItemUpdate } from '@/types';
import { getCart, addToCart, updateCartItemQuantity, removeCartItem } from '@/lib/api/cart';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (item: CartItemCreate) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateItemQuantity: (itemId: string, updates: CartItemUpdate) => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,
  error: null,
  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await getCart();
      set({ cart, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  addItem: async (item) => {
    set({ isLoading: true, error: null });
    try {
      await addToCart(item);
      // After adding, fetch the entire cart to ensure state is consistent
      const updatedCart = await getCart();
      set({ cart: updatedCart, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  removeItem: async (itemId) => {
    set({ isLoading: true, error: null });
    try {
      await removeCartItem(itemId);
      const updatedCart = await getCart();
      set({ cart: updatedCart, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  updateItemQuantity: async (itemId, updates) => {
    set({ isLoading: true, error: null });
    try {
      await updateCartItemQuantity(itemId, updates);
      const updatedCart = await getCart();
      set({ cart: updatedCart, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  clearCart: () => set({ cart: null }),
}));
