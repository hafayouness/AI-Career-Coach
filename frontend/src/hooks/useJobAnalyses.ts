import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { ApiResponse, JobAnalysis } from "../types";

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

  return useMutation({
    mutationFn: async (input: { cvId: number; jobOfferId: number }) => {
      const { data } = await api.post<ApiResponse<JobAnalysis>>(
        "/job-analyses",
        input,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analysisKeys.lists() });
    },
  });
}

export function useDeleteAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/job-analyses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analysisKeys.lists() });
    },
  });
}
