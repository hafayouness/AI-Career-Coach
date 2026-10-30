import { useMutation } from "@tanstack/react-query";
import { api } from "../services/api";
import type { ApiResponse } from "../types";

export interface InterviewMessage {
  role: "assistant" | "user" | "system";
  content: string;
}

export interface InterviewSession {
  id: number;
  userId: number;
  cvId: number;
  jobOfferId: number;
  status: "in_progress" | "completed";
  history: InterviewMessage[];
  report: {
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    advice: string;
  } | null;
}

export function useStartInterview() {
  return useMutation({
    mutationFn: async (data: { cvId: number; jobOfferId: number }) => {
      const res = await api.post<
        ApiResponse<{ session: InterviewSession; message: string }>
      >("/interview-sessions", data);
      return res.data.data;
    },
  });
}

export function useAnswerInterview() {
  return useMutation({
    mutationFn: async ({ id, answer }: { id: number; answer: string }) => {
      const res = await api.post<
        ApiResponse<{ message: string; isFinished: boolean }>
      >(`/interview-sessions/${id}/answer`, { answer });
      return res.data.data;
    },
  });
}

export function useFinishInterview() {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.post<ApiResponse<InterviewSession>>(
        `/interview-sessions/${id}/finish`,
      );
      return res.data.data;
    },
  });
}
