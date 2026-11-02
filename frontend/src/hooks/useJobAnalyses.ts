import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, extractError } from "../services/api";
import type { ApiResponse, JobAnalysis } from "../types";
import { useToastStore } from "../store/toastStore";

export const analysisKeys = {
  all: ["job-analyses"] as const,
  lists: () => [...analysisKeys.all, "list"] as const,
  detail: (id: number) => [...analysisKeys.all, "detail", id] as const,
};


export function useJobAnalyses() {
  return useQuery({
    queryKey: analysisKeys.lists(),
    queryFn: async () => {
      const { data } =
        await api.get<ApiResponse<JobAnalysis[]>>("/job-analyses");
      return data.data;
    },
  });
}


export function useJobAnalysis(id: number | null) {
  return useQuery({
    queryKey: id ? analysisKeys.detail(id) : ["job-analyses", "detail", "none"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<JobAnalysis>>(
        `/job-analyses/${id}`,
      );
      return data.data;
    },
    enabled: !!id,
  });
}


export function useRunAnalysis() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (input: { cvId: number; jobOfferId: number }) => {
      const { data } = await api.post<ApiResponse<JobAnalysis>>(
        "/job-analyses",
        input,
      );
      return data.data;
    },
    onSuccess: (analysis) => {
      queryClient.invalidateQueries({ queryKey: analysisKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] }); // 👈 Dashboard
      addToast(
        "success",
        `Analyse terminée : ${analysis.matchingScore}% de correspondance.`,
      );
    },
    onError: (err) => {
      addToast("error", extractError(err));
    },
  });
}


export function useDeleteAnalysis() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/job-analyses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analysisKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] }); // 👈 Dashboard
      addToast("success", "Analyse supprimée.");
    },
    onError: (err) => {
      addToast("error", extractError(err));
    },
  });
}
