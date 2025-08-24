import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email, password) => Promise<void>;
  logout: () => void;
  fetchUserProfile: (token: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  fetchUserProfile: async (token) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        set({ user: userData });
      } else {
        localStorage.removeItem('token');
        set({ user: null });
      }
    } catch (error) {
      console.error('Failed to fetch user profile', error);
      localStorage.removeItem('token');
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },
  login: async (email, password) => {
    set({ loading: true });
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/auth/login", {
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
    } finally {
      set({ loading: false });
    }
  },
  logout: () => {
    set({ user: null });
    localStorage.removeItem('token');
  },
}));

// Initialize auth state
const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
if (token) {
  useAuthStore.getState().fetchUserProfile(token);
} else {
  useAuthStore.setState({ loading: false });
}
