import { z } from "zod";
import { jobOfferService } from "../services/jobOfferService.js";
import { ok, created, fail } from "../utils/response.js";

const createSchema = z.object({
  title: z.string().min(2),
  company: z.string().optional().nullable(),
  description: z
    .string()
    .min(30, "La description doit faire au moins 30 caractères"),
  sourceUrl: z.string().url().optional().nullable().or(z.literal("")),
  location: z.string().optional().nullable(),
});

const updateSchema = z.object({
  title: z.string().min(2).optional(),
  company: z.string().optional().nullable(),
  description: z.string().min(30).optional(),
  sourceUrl: z.string().url().optional().nullable().or(z.literal("")),
  location: z.string().optional().nullable(),
});

export const jobOfferController = {
  async create(req, res, next) {
    try {
      const data = createSchema.parse(req.body);
      const offer = await jobOfferService.create(req.user.id, data);
      return created(res, offer, "Offre enregistrée, analyse en cours");
    } catch (e) {
      next(e);
    }
  },

  async list(req, res, next) {
    try {
      const offers = await jobOfferService.list(req.user.id);
      return ok(res, offers);
    } catch (e) {
      next(e);
    }
  },

  async get(req, res, next) {
    try {
      const offer = await jobOfferService.get(
        req.user.id,
        Number(req.params.id),
      );
      return ok(res, offer);
    } catch (e) {
      next(e);
    }
  },

  async update(req, res, next) {
    try {
      const data = updateSchema.parse(req.body);
      const offer = await jobOfferService.update(
        req.user.id,
        Number(req.params.id),
        data,
      );
      return ok(res, offer, "Offre mise à jour");
    } catch (e) {
      next(e);
    }
  },

  async remove(req, res, next) {
    try {
      await jobOfferService.remove(req.user.id, Number(req.params.id));
      return ok(res, {}, "Offre supprimée");
    } catch (e) {
      next(e);
    }
  },

  async extractFromImage(req, res, next) {
    try {
      if (!req.file) {
        return fail(res, 400, "Aucune image fournie");
      }
      const offer = await jobOfferService.createFromImage(
        req.user.id,
        req.file,
      );
      return created(res, offer, "Offre importée depuis l'image");
    } catch (e) {
      next(e);
    }
  },
};
