import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { ApiResponse, CV } from "../types";

export const cvKeys = {
  all: ["cvs"] as const,
  lists: () => [...cvKeys.all, "list"] as const,
  detail: (id: number) => [...cvKeys.all, "detail", id] as const,
};

export function useCVs() {
  return useQuery({
    queryKey: cvKeys.lists(),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<CV[]>>("/cvs");
      return data.data;
    },
  });
}

export function useCV(id: number | null) {
  return useQuery({
    queryKey: id ? cvKeys.detail(id) : ["cvs", "detail", "none"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<CV>>(`/cvs/${id}`);
      return data.data;
    },
    enabled: !!id,

    refetchInterval: (query) => {
      const status = query.state.data?.processingStatus;
      return status === "pending" || status === "processing" ? 2000 : false;
    },
  });
}

export function useUploadCV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post<ApiResponse<CV>>("/cvs", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cvKeys.lists() });
    },
  });
}

export function useDeleteCV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/cvs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cvKeys.lists() });
    },
  });
}
