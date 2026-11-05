import {
  CV,
  JobOffer,
  JobAnalysis,
  CVVersion,
  Application,
  Presentation,
} from "../models/index.js";

export const dashboardService = {
  async getStats(userId) {
    const [cvs, offers, analyses, versions, apps, presentations] =
      await Promise.all([
        CV.count({ where: { userId } }),
        JobOffer.count({ where: { userId } }),
        JobAnalysis.count({ where: { userId } }),
        CVVersion.count({
          include: [{ model: CV, as: "cv", where: { userId }, attributes: [] }],
        }),
        Application.count({ where: { userId } }),
        Presentation.count({ where: { userId } }),
      ]);

    return { cvs, offers, analyses, versions, apps, presentations };
  },

  async getRecentActivity(userId) {
    const [recentAnalyses, recentVersions, recentApps] = await Promise.all([
      JobAnalysis.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
        limit: 5,
        include: [{ model: JobOffer, as: "jobOffer", attributes: ["title"] }],
      }),
      CVVersion.findAll({
        include: [{ model: CV, as: "cv", where: { userId }, attributes: [] }],
        order: [["createdAt", "DESC"]],
        limit: 5,
      }),
      Application.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
        limit: 5,
        include: [{ model: JobOffer, as: "jobOffer", attributes: ["title"] }],
      }),
    ]);

    const activities = [
      ...recentAnalyses.map((a) => ({
        id: `an-${a.id}`,
        type: "analysis",
        title: `Analyse : ${a.jobOffer?.title || "Offre"}`,
        date: a.createdAt,
        score: a.matchingScore,
      })),
      ...recentVersions.map((v) => ({
        id: `ve-${v.id}`,
        type: "version",
        title: `CV adapté (v${v.versionNumber})`,
        date: v.createdAt,
      })),
      ...recentApps.map((a) => ({
        id: `ap-${a.id}`,
        type: "application",
        title: `Candidature : ${a.jobOffer?.title || "Poste"}`,
        date: a.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    return activities;
  },
};
