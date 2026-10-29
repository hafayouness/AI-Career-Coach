import { z } from "zod";
import { interviewQuestionService } from "../services/interviewQuestionService.js";
import { ok, created } from "../utils/response.js";

const generateSchema = z.object({
  cvId: z.number().int().positive(),
  jobOfferId: z.number().int().positive(),
  categories: z
    .array(z.enum(["RH", "Technique", "Comportemental", "Projet"]))
    .min(1),
});

export const interviewQuestionController = {
  async generate(req, res, next) {
    try {
      const data = generateSchema.parse(req.body);
      const questions = await interviewQuestionService.generate(
        req.user.id,
        data,
      );
      return created(res, questions, "Questions générées avec succès");
    } catch (e) {
      next(e);
    }
  },

  async list(req, res, next) {
    try {
      const questions = await interviewQuestionService.list(req.user.id);
      return ok(res, questions);
    } catch (e) {
      next(e);
    }
  },

  async remove(req, res, next) {
    try {
      await interviewQuestionService.remove(req.user.id, Number(req.params.id));
      return ok(res, {}, "Question supprimée");
    } catch (e) {
      next(e);
    }
  },
};
