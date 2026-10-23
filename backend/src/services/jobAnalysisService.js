import { JobAnalysis, CV, JobOffer } from "../models/index.js";
import { matchingAnalysisService } from "./matchingAnalysisService.js";

export const jobAnalysisService = {
  async analyze(userId, cvId, jobOfferId) {
    const [cv, offer] = await Promise.all([
      CV.findOne({ where: { id: cvId, userId } }),
      JobOffer.findOne({ where: { id: jobOfferId, userId } }),
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

    if (cv.processingStatus !== "completed") {
      const e = new Error("Le CV n'a pas encore terminé son analyse");
      e.status = 422;
      throw e;
    }
    if (offer.parsingStatus !== "completed") {
      const e = new Error("L'offre n'a pas encore terminé son analyse");
      e.status = 422;
      throw e;
    }

    const result = await matchingAnalysisService.analyze(cv, offer);

    const existing = await JobAnalysis.findOne({
      where: { cvId, jobOfferId },
    });

    const payload = {
      userId,
      cvId,
      jobOfferId,
      matchingScore: result.matchingScore,
      matchingDetails: {
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        matchedRequirements: result.matchedRequirements,
        missingRequirements: result.missingRequirements,
        relevantExperiences: result.relevantExperiences,
        strengths: result.strengths,
        gaps: result.gaps,
      },
      recommendations: {
        list: result.recommendations,
        atsKeywords: result.atsKeywords,
      },
    };

    if (existing) {
      await existing.update(payload);
      return existing;
    }
    return JobAnalysis.create(payload);
  },

  async list(userId) {
    return JobAnalysis.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: CV,
          as: "cv",
          attributes: ["id", "originalFileName", "parsedData"],
        },
        {
          model: JobOffer,
          as: "jobOffer",
          attributes: ["id", "title", "company", "location"],
        },
      ],
    });
  },

  async get(userId, id) {
    const analysis = await JobAnalysis.findOne({
      where: { id, userId },
      include: [
        {
          model: CV,
          as: "cv",
          attributes: ["id", "originalFileName", "parsedData"],
        },
        {
          model: JobOffer,
          as: "jobOffer",
          attributes: ["id", "title", "company", "location", "requirements"],
        },
      ],
    });

    if (!analysis) {
      const e = new Error("Analyse introuvable");
      e.status = 404;
      throw e;
    }
    return analysis;
  },

  async remove(userId, id) {
    const analysis = await this.get(userId, id);
    await analysis.destroy();
  },
};
