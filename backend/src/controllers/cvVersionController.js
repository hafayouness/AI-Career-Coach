import { z } from "zod";
import { cvVersionService } from "../services/cvVersionService.js";
import { pdfGenerationService } from "../services/pdfGenerationService.js";
import { ok, created } from "../utils/response.js";

const generateSchema = z.object({
  cvId: z.number().int().positive(),
  jobOfferId: z.number().int().positive(),
});

const updateSchema = z.object({
  content: z.object({}).passthrough(),
});

export const cvVersionController = {
  async generate(req, res, next) {
    try {
      const { cvId, jobOfferId } = generateSchema.parse(req.body);
      const version = await cvVersionService.generate(
        req.user.id,
        cvId,
        jobOfferId,
      );
      return created(res, version, "CV adapté généré");
    } catch (e) {
      next(e);
    }
  },

  async listAll(req, res, next) {
    try {
      const versions = await cvVersionService.listAll(req.user.id);
      return ok(res, versions);
    } catch (e) {
      next(e);
    }
  },

  async listByCV(req, res, next) {
    try {
      const versions = await cvVersionService.list(
        req.user.id,
        Number(req.params.cvId),
      );
      return ok(res, versions);
    } catch (e) {
      next(e);
    }
  },

  async get(req, res, next) {
    try {
      const version = await cvVersionService.get(
        req.user.id,
        Number(req.params.id),
      );
      return ok(res, version);
    } catch (e) {
      next(e);
    }
  },

  async update(req, res, next) {
    try {
      const { content } = updateSchema.parse(req.body);
      const version = await cvVersionService.update(
        req.user.id,
        Number(req.params.id),
        content,
      );
      return ok(res, version, "CV mis à jour");
    } catch (e) {
      next(e);
    }
  },

  async validate(req, res, next) {
    try {
      const version = await cvVersionService.validate(
        req.user.id,
        Number(req.params.id),
      );
      return ok(res, version, "CV validé");
    } catch (e) {
      next(e);
    }
  },

  async remove(req, res, next) {
    try {
      await cvVersionService.remove(req.user.id, Number(req.params.id));
      return ok(res, {}, "Version supprimée");
    } catch (e) {
      next(e);
    }
  },

  async downloadPDF(req, res, next) {
    try {
      const version = await cvVersionService.get(
        req.user.id,
        Number(req.params.id),
      );
      const pdfBuffer = await pdfGenerationService.generatePDF(version.content);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="CV-${version.content.header.name.replace(/\s+/g, "-")}.pdf"`,
      );
      return res.send(pdfBuffer);
    } catch (e) {
      next(e);
    }
  },
};
