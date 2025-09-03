export const getApiUrl = (): string => {
  const isServer = typeof window === 'undefined';
  const url = isServer
    ? process.env.INTERNAL_API_BASE_URL
    : process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!url) {
    // In a real app, you might have better error handling or logging
    throw new Error('API URL is not configured. Please check your environment variables.');
  }

  return url;
};
