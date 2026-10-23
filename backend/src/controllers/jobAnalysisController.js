import { z } from "zod";
import { jobAnalysisService } from "../services/jobAnalysisService.js";
import { ok, created } from "../utils/response.js";

const analyzeSchema = z.object({
  cvId: z.number().int().positive(),
  jobOfferId: z.number().int().positive(),
});

export const jobAnalysisController = {
  async analyze(req, res, next) {
    try {
      const { cvId, jobOfferId } = analyzeSchema.parse(req.body);
      const analysis = await jobAnalysisService.analyze(
        req.user.id,
        cvId,
        jobOfferId,
      );
      return created(res, analysis, "Analyse de correspondance terminée");
    } catch (e) {
      next(e);
    }
  },

  async list(req, res, next) {
    try {
      const analyses = await jobAnalysisService.list(req.user.id);
      return ok(res, analyses);
    } catch (e) {
      next(e);
    }
  },

  async get(req, res, next) {
    try {
      const analysis = await jobAnalysisService.get(
        req.user.id,
        Number(req.params.id),
      );
      return ok(res, analysis);
    } catch (e) {
      next(e);
    }
  },

  async remove(req, res, next) {
    try {
      await jobAnalysisService.remove(req.user.id, Number(req.params.id));
      return ok(res, {}, "Analyse supprimée");
    } catch (e) {
      next(e);
    }
  },
};
