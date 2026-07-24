import { QueryClient } from "@tanstack/react-query";

/**
 * The app-wide QueryClient.
 *
 * Lives in its own module (rather than in `main.tsx`) so non-React code — the
 * auth store in particular — can clear the cache on sign-in/sign-out without
 * importing the app entry point and creating a circular dependency.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
      gcTime: 5 * 60_000,
    },
  },
});
