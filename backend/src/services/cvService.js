import fs from "fs/promises";
import { CV } from "../models/index.js";
import { documentExtractionService } from "./documentExtractionService.js";
import { cvAnalysisService } from "./cvAnalysisService.js";

export const cvService = {
  async create(userId, file) {
    const cv = await CV.create({
      userId,
      originalFileName: file.originalname,
      storagePath: file.path,
      mimeType: file.mimetype,
      fileSize: file.size,
      processingStatus: "pending",
    });

    this.processInBackground(cv.id, file.path, file.mimetype);

    return cv;
  },

  async processInBackground(cvId, filePath, mimeType) {
    try {
      await CV.update(
        { processingStatus: "processing" },
        { where: { id: cvId } },
      );

      const text = await documentExtractionService.extractText(
        filePath,
        mimeType,
      );
      const parsed = await cvAnalysisService.parseCV(text);

      await CV.update(
        {
          extractedText: text,
          parsedData: parsed,
          processingStatus: "completed",
          processingError: null,
        },
        { where: { id: cvId } },
      );
    } catch (err) {
      console.error(`CV ${cvId} échoué:`, err.message);
      await CV.update(
        { processingStatus: "failed", processingError: err.message },
        { where: { id: cvId } },
      );
    }
  },

  async list(userId) {
    return CV.findAll({
      where: { userId },
      attributes: { exclude: ["extractedText"] },
      order: [["createdAt", "DESC"]],
    });
  },

  async get(userId, cvId) {
    const cv = await CV.findOne({ where: { id: cvId, userId } });
    if (!cv) {
      const e = new Error("CV introuvable");
      e.status = 404;
      throw e;
    }
    return cv;
  },

  async remove(userId, cvId) {
    const cv = await this.get(userId, cvId);
    try {
      await fs.unlink(cv.storagePath);
    } catch (err) {
      if (err.code !== "ENOENT") {
        console.error(
          `Erreur lors de la suppression du fichier CV ${cvId} :`,
          err.message,
        );

        const e = new Error("Impossible de supprimer le fichier du CV");
        e.status = 500;
        throw e;
      }
    }
    await cv.destroy();
  },
};
