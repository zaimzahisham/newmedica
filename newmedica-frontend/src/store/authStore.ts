import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { useCartStore } from './cartStore';

interface AuthState {
  user: User | null;
  loading: boolean;
  token: string | null; // Add token to AuthState
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
      token: null, // Initialize token
      checkAuth: () => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          set({ token: storedToken }); // Set token from localStorage
          get().fetchUserProfile(storedToken);
        } else {
          set({ loading: false, token: null });
        }
      },
      fetchUserProfile: async (token) => {
        set({ loading: true, token }); // Set token when fetching profile
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
            set({ user: null, loading: false, token: null });
          }
        } catch (error) {
          console.error('Failed to fetch user profile', error);
          localStorage.removeItem('token');
          set({ user: null, loading: false, token: null });
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
            set({ token: data.access_token }); // Set token on successful login
            await get().fetchUserProfile(data.access_token);
          } else {
            throw new Error('Login failed');
          }
        } catch (error) {
          console.error(error);
          set({ loading: false, token: null });
        }
      },
      logout: () => {
        set({ user: null, loading: false, token: null }); // Clear token on logout
        localStorage.removeItem('token');
        useCartStore.getState().clearCart(); // Clear cart on logout
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
