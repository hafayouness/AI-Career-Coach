import { z } from "zod";
import { presentationService } from "../services/presentationService.js";
import { ok, created } from "../utils/response.js";

const generateSchema = z.object({
  cvId: z.number().int().positive(),
  jobOfferId: z.number().int().positive(),
  language: z.enum(["fr", "en", "ar"]).default("fr"),
  type: z.enum([
    "30s",
    "1min",
    "2min",
    "tell_me_about_yourself",
    "why_this_job",
    "why_hire_you",
    "strengths_weaknesses",
  ]),
});

export const presentationController = {
  async generate(req, res, next) {
    try {
      const data = generateSchema.parse(req.body);
      const p = await presentationService.generate(req.user.id, data);
      return created(res, p, "Présentation générée");
    } catch (e) {
      next(e);
    }
  },

  async list(req, res, next) {
    try {
      return ok(res, await presentationService.list(req.user.id));
    } catch (e) {
      next(e);
    }
  },

  async get(req, res, next) {
    try {
      return ok(
        res,
        await presentationService.get(req.user.id, Number(req.params.id)),
      );
    } catch (e) {
      next(e);
    }
  },

  async update(req, res, next) {
    try {
      const { content } = z
        .object({ content: z.string().min(1) })
        .parse(req.body);
      return ok(
        res,
        await presentationService.update(
          req.user.id,
          Number(req.params.id),
          content,
        ),
        "Mise à jour réussie",
      );
    } catch (e) {
      next(e);
    }
  },

  async remove(req, res, next) {
    try {
      await presentationService.remove(req.user.id, Number(req.params.id));
      return ok(res, {}, "Supprimée");
    } catch (e) {
      next(e);
    }
  },
};
