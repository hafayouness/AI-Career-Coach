import { z } from "zod";
import { applicationService } from "../services/applicationService.js";
import { ok, created } from "../utils/response.js";

const schema = z.object({
  jobOfferId: z.number().nullable().optional(),
  cvVersionId: z.number().nullable().optional(),
  status: z
    .enum([
      "to_prepare",
      "sent",
      "interview_scheduled",
      "interview_done",
      "offer_received",
      "rejected",
      "withdrawn",
    ])
    .optional(),
  notes: z.string().nullable().optional(),
  appliedAt: z.string().nullable().optional(),
  interviewAt: z.string().nullable().optional(),
  nextAction: z.string().nullable().optional(),
});

export const applicationController = {
  async create(req, res, next) {
    try {
      const data = schema.parse(req.body);
      return created(res, await applicationService.create(req.user.id, data));
    } catch (e) {
      next(e);
    }
  },
  async list(req, res, next) {
    try {
      return ok(res, await applicationService.list(req.user.id));
    } catch (e) {
      next(e);
    }
  },
  async update(req, res, next) {
    try {
      const data = schema.partial().parse(req.body);
      return ok(
        res,
        await applicationService.update(
          req.user.id,
          Number(req.params.id),
          data,
        ),
      );
    } catch (e) {
      next(e);
    }
  },
  async remove(req, res, next) {
    try {
      await applicationService.remove(req.user.id, Number(req.params.id));
      return ok(res, {}, "Supprimée");
    } catch (e) {
      next(e);
    }
  },
};
