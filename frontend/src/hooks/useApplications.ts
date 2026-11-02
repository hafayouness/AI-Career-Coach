import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, extractError } from "../services/api";
import type { ApiResponse, Application } from "../types";
import { useToastStore } from "../store/toastStore";

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
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post<ApiResponse<Application>>(
        "/applications",
        data,
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appKeys.all });
      qc.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      addToast("success", "Candidature ajoutée avec succès !");
    },
    onError: (err) => {
      addToast("error", extractError(err));
    },
  });
}
export function useUpdateApplication() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      await api.patch(`/applications/${id}`, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appKeys.all });
      qc.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      addToast("success", "Candidature mise à jour.");
    },
    onError: (err) => {
      addToast("error", extractError(err));
    },
  });
}

export function useDeleteApplication() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/applications/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appKeys.all });
      qc.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      addToast("success", "Candidature supprimée.");
    },
    onError: (err) => {
      addToast("error", extractError(err));
    },
  });
}
