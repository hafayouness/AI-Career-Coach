import { Application, JobOffer, CVVersion } from "../models/index.js";

export const applicationService = {
  async create(userId, data) {
    return Application.create({ userId, ...data });
  },
  async list(userId) {
    return Application.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      include: [
        { model: JobOffer, as: "jobOffer", attributes: ["title", "company"] },
        { model: CVVersion, as: "cvVersion", attributes: ["versionNumber"] },
      ],
    });
  },
  async update(userId, id, data) {
    const app = await Application.findOne({ where: { id, userId } });
    if (!app) throw Object.assign(new Error("Introuvable"), { status: 404 });
    await app.update(data);
    return app;
  },
  async remove(userId, id) {
    const app = await Application.findOne({ where: { id, userId } });
    if (!app) throw Object.assign(new Error("Introuvable"), { status: 404 });
    await app.destroy();
  },
};
