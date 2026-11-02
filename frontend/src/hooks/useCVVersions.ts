import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, extractError } from "../services/api";
import type { ApiResponse, CVVersion, CVVersionContent } from "../types";
import { useToastStore } from "../store/toastStore";

export const cvVersionKeys = {
  all: ["cv-versions"] as const,
  lists: () => [...cvVersionKeys.all, "list"] as const,
  detail: (id: number) => [...cvVersionKeys.all, "detail", id] as const,
};

export function useCVVersions() {
  return useQuery({
    queryKey: cvVersionKeys.lists(),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<CVVersion[]>>("/cv-versions");
      return data.data;
    },
  });
}

export function useCVVersion(id: number | null) {
  return useQuery({
    queryKey: id ? cvVersionKeys.detail(id) : ["cv-versions", "detail", "none"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<CVVersion>>(
        `/cv-versions/${id}`,
      );
      return data.data;
    },
    enabled: !!id,
  });
}

export function useGenerateCVVersion() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (input: { cvId: number; jobOfferId: number }) => {
      const { data } = await api.post<ApiResponse<CVVersion>>(
        "/cv-versions/generate",
        input,
      );
      return data.data;
    },
    onSuccess: (v) => {
      queryClient.invalidateQueries({ queryKey: cvVersionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] }); // 👈
      addToast("success", `CV adapté v${v.versionNumber} généré !`);
    },
    onError: (err) => {
      addToast("error", extractError(err));
    },
  });
}

export function useUpdateCVVersion() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({
      id,
      content,
    }: {
      id: number;
      content: CVVersionContent;
    }) => {
      const { data } = await api.patch<ApiResponse<CVVersion>>(
        `/cv-versions/${id}`,
        { content },
      );
      return data.data;
    },
    onSuccess: (v) => {
      queryClient.invalidateQueries({ queryKey: cvVersionKeys.detail(v.id) });
      queryClient.invalidateQueries({ queryKey: cvVersionKeys.lists() });
      addToast("success", "CV adapté mis à jour.");
    },
    onError: (err) => {
      addToast("error", extractError(err));
    },
  });
}

export function useValidateCVVersion() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post<ApiResponse<CVVersion>>(
        `/cv-versions/${id}/validate`,
      );
      return data.data;
    },
    onSuccess: (v) => {
      queryClient.invalidateQueries({ queryKey: cvVersionKeys.detail(v.id) });
      queryClient.invalidateQueries({ queryKey: cvVersionKeys.lists() });
      addToast("success", "CV validé. Il ne peut plus être modifié.");
    },
    onError: (err) => {
      addToast("error", extractError(err));
    },
  });
}

export function useDeleteCVVersion() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/cv-versions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cvVersionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] }); // 👈
      addToast("success", "Version supprimée.");
    },
    onError: (err) => {
      addToast("error", extractError(err));
    },
  });
}

export async function downloadCVVersionPDF(id: number, filename: string) {
  const response = await api.get(`/cv-versions/${id}/pdf`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function useCreateManualCVVersion() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (input: { cvId: number; jobOfferId: number }) => {
      const { data } = await api.post<ApiResponse<CVVersion>>(
        "/cv-versions/manual",
        input,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cvVersionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      addToast("success", "CV adapté créé manuellement !");
    },
    onError: (err) => {
      addToast("error", extractError(err));
    },
  });
}
