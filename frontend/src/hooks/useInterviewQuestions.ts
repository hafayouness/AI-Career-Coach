import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { ApiResponse, InterviewQuestion } from "../types";

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
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: questionKeys.all }),
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/interview-questions/${id}`);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: questionKeys.all }),
  });
}
