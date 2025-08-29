import { create } from 'zustand';
import { Product, Cart, CartItem as ICartItem, CartItemCreate, CartItemUpdate } from '@/types';
import { getCart, addToCart, updateCartItemQuantity, removeCartItem } from '@/lib/api/cart';

interface CartState {
  cartId: string | null;
  items: ICartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (item: CartItemCreate) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateItemQuantity: (itemId: string, updates: CartItemUpdate) => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartId: null,
  items: [],
  subtotal: 0,
  discount: 0,
  shipping: 0,
  total: 0,
  isLoading: true,
  error: null,
  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await getCart();
      set({
        cartId: cart.id,
        items: cart.items,
        subtotal: cart.subtotal,
        discount: cart.discount,
        shipping: cart.shipping,
        total: cart.total,
        isLoading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  addItem: async (item) => {
    try {
      await addToCart(item);
      await get().fetchCart(); // Refetch cart to get the latest state
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  removeItem: async (itemId) => {
    try {
      await removeCartItem(itemId);
      await get().fetchCart();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  updateItemQuantity: async (itemId, updates) => {
    try {
      await updateCartItemQuantity(itemId, updates);
      await get().fetchCart();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  clearCart: () => set({ items: [], subtotal: 0, discount: 0, shipping: 0, total: 0, cartId: null }),
}));
