import { cvService } from "../services/cvService.js";
import { ok, created, fail } from "../utils/response.js";

export const cvController = {
  async upload(req, res, next) {
    try {
      if (!req.file) return fail(res, 400, "Aucun fichier fourni");
      const cv = await cvService.create(req.user.id, req.file);
      return created(res, cv, "CV importé, analyse en cours");
    } catch (e) {
      next(e);
    }
  },

  async list(req, res, next) {
    try {
      const cvs = await cvService.list(req.user.id);
      return ok(res, cvs);
    } catch (e) {
      next(e);
    }
  },

  async get(req, res, next) {
    try {
      const cv = await cvService.get(req.user.id, Number(req.params.id));
      return ok(res, cv);
    } catch (e) {
      next(e);
    }
  },

  async remove(req, res, next) {
    try {
      await cvService.remove(req.user.id, Number(req.params.id));
      return ok(res, {}, "CV supprimé");
    } catch (e) {
      next(e);
    }
  },
};
