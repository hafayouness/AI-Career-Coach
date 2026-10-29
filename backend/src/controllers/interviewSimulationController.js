import { interviewSimulationService } from "../services/interviewSimulationService.js";
import { CV, JobOffer } from "../models/index.js";
import { ok, created } from "../utils/response.js";
import { z } from "zod";

export const interviewSimulationController = {
  async start(req, res, next) {
    try {
      const { cvId, jobOfferId } = z
        .object({ cvId: z.number(), jobOfferId: z.number() })
        .parse(req.body);

      const [cv, offer] = await Promise.all([
        CV.findOne({ where: { id: cvId, userId: req.user.id } }),
        JobOffer.findOne({ where: { id: jobOfferId, userId: req.user.id } }),
      ]);

      const result = await interviewSimulationService.start(req.user.id, {
        cvId,
        jobOfferId,
        cvData: cv.parsedData,
        offerData: offer.requirements,
      });
      return created(res, result, "Entretien démarré");
    } catch (e) {
      next(e);
    }
  },

  async answer(req, res, next) {
    try {
      const { answer } = z
        .object({ answer: z.string().min(1) })
        .parse(req.body);
      const result = await interviewSimulationService.answer(
        req.user.id,
        Number(req.params.id),
        answer,
      );
      return ok(res, result);
    } catch (e) {
      next(e);
    }
  },

  async finish(req, res, next) {
    try {
      const session = await interviewSimulationService.finishAndGenerateReport(
        req.user.id,
        Number(req.params.id),
      );
      return ok(res, session, "Rapport généré");
    } catch (e) {
      next(e);
    }
  },
};
