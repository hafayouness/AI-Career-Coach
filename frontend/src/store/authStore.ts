import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type User } from "../types/index.ts";

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: "ai-career-coach-auth",
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);

export const useAuthUser = () => useAuthStore((s) => s.user);
export const useAuthToken = () => useAuthStore((s) => s.token);
