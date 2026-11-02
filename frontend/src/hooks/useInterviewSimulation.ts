import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, extractError } from "../services/api";
import type { ApiResponse, InterviewSession } from "../types";
import { useToastStore } from "../store/toastStore";

export function useStartInterview() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: { cvId: number; jobOfferId: number }) => {
      const res = await api.post<
        ApiResponse<{ session: InterviewSession; message: string }>
      >("/interview-sessions", data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      addToast("success", "Entretien démarré. Bonne chance !");
    },
    onError: (err) => {
      addToast("error", extractError(err));
    },
  });
}

export function useAnswerInterview() {
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ id, answer }: { id: number; answer: string }) => {
      const res = await api.post<
        ApiResponse<{ message: string; isFinished: boolean }>
      >(`/interview-sessions/${id}/answer`, { answer });
      return res.data.data;
    },
    onError: (err) => {
      addToast("error", extractError(err));
    },
  });
}

export function useFinishInterview() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.post<ApiResponse<InterviewSession>>(
        `/interview-sessions/${id}/finish`,
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      addToast("success", "Rapport d'entretien généré !");
    },
    onError: (err) => {
      addToast("error", extractError(err));
    },
  });
}
