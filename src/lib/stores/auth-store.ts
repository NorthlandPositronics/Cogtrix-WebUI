import { create } from "zustand";
import { api } from "../api/client";
import { setTokens, clearTokens } from "../api/tokens";
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
      await api.post("/auth/logout");
    } finally {
      clearTokens();
      set({ user: null, isAuthenticated: false, isAdmin: false });
    }
  },
}));
