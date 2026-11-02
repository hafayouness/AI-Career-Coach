import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, extractError } from "../services/api";
import type { ApiResponse, JobOffer, CreateJobOfferInput } from "../types";
import { useToastStore } from "../store/toastStore";

export const jobOfferKeys = {
  all: ["job-offers"] as const,
  lists: () => [...jobOfferKeys.all, "list"] as const,
  detail: (id: number) => [...jobOfferKeys.all, "detail", id] as const,
};


export function useJobOffers() {
  return useQuery({
    queryKey: jobOfferKeys.lists(),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<JobOffer[]>>("/job-offers");
      return data.data;
    },
  });
}


export function useJobOffer(id: number | null) {
  return useQuery({
    queryKey: id ? jobOfferKeys.detail(id) : ["job-offers", "detail", "none"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<JobOffer>>(
        `/job-offers/${id}`,
      );
      return data.data;
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.parsingStatus;
      return status === "pending" || status === "processing" ? 2000 : false;
    },
  });
}


export function useCreateJobOffer() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (input: CreateJobOfferInput) => {
      const { data } = await api.post<ApiResponse<JobOffer>>(
        "/job-offers",
        input,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobOfferKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] }); // 👈
      addToast("success", "Offre enregistrée, analyse en cours…");
    },
    onError: (err) => {
      addToast("error", extractError(err));
    },
  });
}


export function useUpdateJobOffer() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: number;
      input: Partial<CreateJobOfferInput>;
    }) => {
      const { data } = await api.patch<ApiResponse<JobOffer>>(
        `/job-offers/${id}`,
        input,
      );
      return data.data;
    },
    onSuccess: (offer) => {
      queryClient.invalidateQueries({ queryKey: jobOfferKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: jobOfferKeys.detail(offer.id),
      });
      addToast("success", "Offre mise à jour.");
    },
    onError: (err) => {
      addToast("error", extractError(err));
    },
  });
}


export function useDeleteJobOffer() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/job-offers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobOfferKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] }); 
      addToast("success", "Offre supprimée.");
    },
    onError: (err) => {
      addToast("error", extractError(err));
    },
  });
}


export function useExtractJobOfferFromImage() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post<ApiResponse<JobOffer>>(
        "/job-offers/extract-from-image",
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobOfferKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      addToast("success", "Offre extraite depuis l'image !");
    },
    onError: (err) => {
      addToast("error", extractError(err));
    },
  });
}