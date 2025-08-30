// src/types/next.d.ts
export {};

declare global {
  interface PageProps {
    params?: {
      [key: string]: string | string[];
    };
    searchParams?: {
      [key: string]: string | string[] | undefined;
    };
  }
}
