import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, extractError } from "../services/api";
import type { ApiResponse, InterviewQuestion } from "../types";
import { useToastStore } from "../store/toastStore";

export const questionKeys = { all: ["interview-questions"] as const };

export function useInterviewQuestions() {
  return useQuery({
    queryKey: questionKeys.all,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<InterviewQuestion[]>>(
        "/interview-questions",
      );
      return data.data;
    },
  });
}

export function useGenerateQuestions() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (input: {
      cvId: number;
      jobOfferId: number;
      categories: string[];
    }) => {
      const { data } = await api.post<ApiResponse<InterviewQuestion[]>>(
        "/interview-questions/generate",
        input,
      );
      return data.data;
    },
    onSuccess: (questions) => {
      queryClient.invalidateQueries({ queryKey: questionKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] }); // 👈 Dashboard
      addToast(
        "success",
        `${questions.length} questions générées avec succès !`,
      );
    },
    onError: (err) => {
      addToast("error", extractError(err));
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/interview-questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      addToast("success", "Question supprimée.");
    },
    onError: (err) => {
      addToast("error", extractError(err));
    },
  });
}
