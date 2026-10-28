import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { ApiResponse, Presentation } from "../types";

export const presentationKeys = {
  all: ["presentations"] as const,
  lists: () => [...presentationKeys.all, "list"] as const,
};

export function usePresentations() {
  return useQuery({
    queryKey: presentationKeys.lists(),
    queryFn: async () => {
      const { data } =
        await api.get<ApiResponse<Presentation[]>>("/presentations");
      return data.data;
    },
  });
}

export function useGeneratePresentation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      cvId: number;
      jobOfferId: number;
      language: string;
      type: string;
    }) => {
      const { data } = await api.post<ApiResponse<Presentation>>(
        "/presentations/generate",
        input,
      );
      return data.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: presentationKeys.lists() }),
  });
}

export function useUpdatePresentation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) => {
      const { data } = await api.patch<ApiResponse<Presentation>>(
        `/presentations/${id}`,
        { content },
      );
      return data.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: presentationKeys.lists() }),
  });
}

export function useDeletePresentation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/presentations/${id}`);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: presentationKeys.lists() }),
  });
}
