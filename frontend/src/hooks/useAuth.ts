import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse } from "../services/api";
import { useAuthStore } from "../store/authStore";
import type { AuthResponse, User } from "../types";

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (c: { email: string; password: string }) => {
      const { data } = await api.post<ApiResponse<AuthResponse>>(
        "/auth/login",
        c,
      );
      return data.data;
    },
    onSuccess: (d) => {
      setAuth(d.user, d.token);
      navigate("/dashboard");
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (p: {
      name: string;
      email: string;
      password: string;
    }) => {
      const { data } = await api.post<ApiResponse<AuthResponse>>(
        "/auth/register",
        p,
      );
      return data.data;
    },
    onSuccess: (d) => {
      setAuth(d.user, d.token);
      navigate("/dashboard");
    },
  });
}

export function useMe() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<User>>("/auth/me");
      setUser(data.data);
      return data.data;
    },
    enabled: !!token,
    retry: false,
    staleTime: 10 * 60 * 1000,
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);

  return () => {
    logout();
    queryClient.clear();
    navigate("/login");
  };
}
