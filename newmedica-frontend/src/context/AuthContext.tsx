
"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';
import { users } from '@/data/users';

interface AuthContextType {
  user: User | null;
  login: (userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(users[0]); // Default to the first user being logged in

  const login = (userId: string) => {
    const userToLogin = users.find(u => u.id === userId);
    setUser(userToLogin || null);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
