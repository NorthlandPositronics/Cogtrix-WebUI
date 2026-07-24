import { create } from "zustand";
import { api } from "../api/client";
import { setTokens, clearTokens, getRefreshToken } from "../api/tokens";
import { queryClient } from "../query-client";
import type { TokenPair, UserOut } from "../api/types";

interface AuthState {
  user: UserOut | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;

  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: false,

  login: async (username, password) => {
    set({ isLoading: true });
    // Also clear here, not just on logout: a session can end without logout()
    // running (expired refresh token redirecting to /login), and that path would
    // otherwise leave the previous user's cache intact.
    queryClient.clear();
    try {
      const tokens = await api.post<TokenPair>("/auth/login", { username, password });
      setTokens(tokens);
      const user = await api.get<UserOut>("/auth/me");
      set({ user, isAuthenticated: true, isAdmin: user.role === "admin" });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (username, email, password) => {
    set({ isLoading: true });
    try {
      const tokens = await api.post<TokenPair>("/auth/register", { username, email, password });
      setTokens(tokens);
      const user = await api.get<UserOut>("/auth/me");
      set({ user, isAuthenticated: true, isAdmin: user.role === "admin" });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      // Backend requires the refresh token in the body so it can revoke the
      // server-side session; a bodyless POST 422s and leaves the token valid.
      const refresh_token = getRefreshToken();
      if (refresh_token) await api.post("/auth/logout", { refresh_token });
    } finally {
      clearTokens();
      set({ user: null, isAuthenticated: false, isAdmin: false });
      // Sessions/config/providers/models are cached with a 5-minute staleTime and
      // gcTime, so without this the next user to sign in on this tab is served
      // the previous user's data immediately and without a refetch.
      queryClient.clear();
    }
  },
}));
