import { create } from 'zustand';
import { Product, Cart, CartItem as ICartItem, CartItemCreate, CartItemUpdate } from '@/types';
import { getCart, addToCart, updateCartItemQuantity, removeCartItem } from '@/lib/api/cart';

interface CartState {
  cartId: string | null;
  items: ICartItem[];
  total: number;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (item: CartItemCreate) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateItemQuantity: (itemId: string, updates: CartItemUpdate) => Promise<void>;
  clearCart: () => void;
}

const calculateTotal = (items: ICartItem[]) => {
  return items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
};

export const useCartStore = create<CartState>((set, get) => ({
  cartId: null,
  items: [],
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
        total: calculateTotal(cart.items),
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
  clearCart: () => set({ items: [], total: 0, cartId: null }),
}));
