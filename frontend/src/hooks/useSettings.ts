import { useMutation } from "@tanstack/react-query";
import { api } from "../services/api";
import { useAuthStore } from "../store/authStore";
import type { ApiResponse, User } from "../types";

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.patch<ApiResponse<User>>("/auth/profile", {
        name,
      });
      return data.data;
    },
    onSuccess: (user) => setUser(user),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (input: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const { data } = await api.patch<ApiResponse<{}>>(
        "/auth/password",
        input,
      );
      return data.data;
    },
  });
}
