import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { useCartStore } from './cartStore';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUserProfile: (token: string) => Promise<void>;
  checkAuth: () => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set, get) => ({
      user: null,
      loading: true,
      checkAuth: () => {
        const token = localStorage.getItem('token');
        if (token) {
          get().fetchUserProfile(token);
        } else {
          set({ loading: false });
        }
      },
      fetchUserProfile: async (token) => {
        set({ loading: true });
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            set({ user: userData, loading: false });
          } else {
            localStorage.removeItem('token');
            set({ user: null, loading: false });
          }
        } catch (error) {
          console.error('Failed to fetch user profile', error);
          localStorage.removeItem('token');
          set({ user: null, loading: false });
        }
      },
      login: async (email, password) => {
        set({ loading: true });
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              username: email,
              password: password,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            await get().fetchUserProfile(data.access_token);
          } else {
            throw new Error('Login failed');
          }
        } catch (error) {
          console.error(error);
          set({ loading: false });
        }
      },
      logout: () => {
        set({ user: null, loading: false });
        localStorage.removeItem('token');
        useCartStore.getState().clearCart(); // Clear cart on logout
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
