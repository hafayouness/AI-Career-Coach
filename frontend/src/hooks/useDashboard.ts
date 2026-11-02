import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { ApiResponse, DashboardStats, ActivityItem } from "../types";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const { data } =
        await api.get<ApiResponse<DashboardStats>>("/dashboard/stats");
      return data.data;
    },

    refetchInterval: 30_000,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ["dashboard", "activity"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ActivityItem[]>>(
        "/dashboard/activity",
      );
      return data.data;
    },
    refetchInterval: 30_000,
  });
}
