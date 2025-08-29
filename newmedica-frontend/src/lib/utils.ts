import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('token');
};

export function formatVoucherCode(code: string | null | undefined): string | null {
  if (!code) {
    return null;
  }
  return code.replace(/_/g, ' ');
}
