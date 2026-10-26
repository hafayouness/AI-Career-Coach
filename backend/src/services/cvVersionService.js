import { CVVersion, CV, JobOffer, JobAnalysis } from "../models/index.js";
import { cvGenerationService } from "./cvGenerationService.js";
import { antiInventionService } from "./antiInventionService.js";

export const cvVersionService = {
  async generate(userId, cvId, jobOfferId) {
    const [cv, offer, analysis] = await Promise.all([
      CV.findOne({ where: { id: cvId, userId } }),
      JobOffer.findOne({ where: { id: jobOfferId, userId } }),
      JobAnalysis.findOne({ where: { cvId, jobOfferId, userId } }),
    ]);

    if (!cv) {
      const e = new Error("CV introuvable");
      e.status = 404;
      throw e;
    }
    if (!offer) {
      const e = new Error("Offre introuvable");
      e.status = 404;
      throw e;
    }
    if (!analysis) {
      const e = new Error("Lancez d'abord une analyse de correspondance");
      e.status = 422;
      throw e;
    }
    if (cv.processingStatus !== "completed") {
      const e = new Error("Le CV n'est pas encore analysé");
      e.status = 422;
      throw e;
    }

    const generated = await cvGenerationService.generate(
      cv.parsedData,
      offer.requirements,
      analysis.matchingDetails,
    );

    const check = antiInventionService.check(generated.content, cv.parsedData);

    const flaggedClaims = [
      ...(generated.changeSummary.flaggedClaims || []),
      ...check.issues.map((i) => `${i.type}: ${i.value} — ${i.reason}`),
    ];

    const lastVersion = await CVVersion.findOne({
      where: { cvId, jobOfferId },
      order: [["versionNumber", "DESC"]],
    });
    const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

    return CVVersion.create({
      cvId,
      jobOfferId,
      versionNumber,
      content: generated.content,
      changeSummary: {
        ...generated.changeSummary,
        flaggedClaims,
        antiInventionIssues: check.issues,
      },
      validated: false,
    });
  },

  async list(userId, cvId) {
    const cv = await CV.findOne({ where: { id: cvId, userId } });
    if (!cv) {
      const e = new Error("CV introuvable");
      e.status = 404;
      throw e;
    }

    return CVVersion.findAll({
      where: { cvId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: JobOffer,
          as: "jobOffer",
          attributes: ["id", "title", "company", "location"],
        },
      ],
    });
  },

  async listAll(userId) {
    return CVVersion.findAll({
      include: [
        {
          model: CV,
          as: "cv",
          where: { userId },
          attributes: ["id", "originalFileName"],
        },
        {
          model: JobOffer,
          as: "jobOffer",
          attributes: ["id", "title", "company"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  },

  async get(userId, id) {
    const version = await CVVersion.findOne({
      where: { id },
      include: [
        {
          model: CV,
          as: "cv",
          where: { userId },
          attributes: ["id", "originalFileName", "parsedData"],
        },
        {
          model: JobOffer,
          as: "jobOffer",
          attributes: ["id", "title", "company", "location"],
        },
      ],
    });
    if (!version) {
      const e = new Error("Version introuvable");
      e.status = 404;
      throw e;
    }
    return version;
  },

  async update(userId, id, content) {
    const version = await this.get(userId, id);
    if (version.validated) {
      const e = new Error("Impossible de modifier une version validée");
      e.status = 409;
      throw e;
    }
    await version.update({ content });
    return version;
  },

  async validate(userId, id) {
    const version = await this.get(userId, id);
    await version.update({ validated: true, validatedAt: new Date() });
    return version;
  },

  async remove(userId, id) {
    const version = await this.get(userId, id);
    await version.destroy();
  },
};
