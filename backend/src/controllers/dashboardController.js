import { dashboardService } from "../services/dashboardService.js";
import { ok } from "../utils/response.js";

export const dashboardController = {
  async getStats(req, res, next) {
    try {
      return ok(res, await dashboardService.getStats(req.user.id));
    } catch (e) {
      next(e);
    }
  },
  async getActivity(req, res, next) {
    try {
      return ok(res, await dashboardService.getRecentActivity(req.user.id));
    } catch (e) {
      next(e);
    }
  },
};
