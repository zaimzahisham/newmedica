import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUserProfile: (token: string) => Promise<void>;
  setNotLoading: () => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      user: null,
      loading: true,
      setNotLoading: () => set({ loading: false }),
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
            await useAuthStore.getState().fetchUserProfile(data.access_token);
          } else {
            throw new Error('Login failed');
          }
        } catch (error) {
          console.error(error);
          set({ loading: false });
        }
      },
      logout: () => {
        set({ user: null });
        localStorage.removeItem('token');
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      onRehydrateStorage: () => (state) => {
        const token = localStorage.getItem('token');
        if (token) {
          useAuthStore.getState().fetchUserProfile(token);
        } else {
          useAuthStore.getState().setNotLoading();
        }
      },
    }
  )
);
