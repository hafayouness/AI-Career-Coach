import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { ApiResponse } from "../types";

export type ApplicationStatus =
  | "to_prepare"
  | "sent"
  | "interview_scheduled"
  | "interview_done"
  | "offer_received"
  | "rejected"
  | "withdrawn";

export interface Application {
  id: number;
  status: ApplicationStatus;
  notes: string | null;
  appliedAt: string | null;
  interviewAt: string | null;
  nextAction: string | null;
  jobOffer?: { title: string; company: string } | null;
  cvVersion?: { versionNumber: number } | null;
}

export const appKeys = { all: ["applications"] as const };

export function useApplications() {
  return useQuery({
    queryKey: appKeys.all,
    queryFn: async () => {
      const { data } =
        await api.get<ApiResponse<Application[]>>("/applications");
      return data.data;
    },
  });
}

export function useCreateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      await api.post("/applications", data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: appKeys.all }),
  });
}

export function useUpdateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      await api.patch(`/applications/${id}`, data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: appKeys.all }),
  });
}

export function useDeleteApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/applications/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: appKeys.all }),
  });
}
