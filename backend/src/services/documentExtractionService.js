import fs from "fs/promises";
import path from "path";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export const documentExtractionService = {
  async extractText(filePath, mimeType) {
    const ext = path.extname(filePath).toLowerCase();

    try {
      if (ext === ".pdf" || mimeType === "application/pdf") {
        const buffer = await fs.readFile(filePath);
        const parser = new PDFParse({ data: buffer });

        try {
          const data = await parser.getText();
          const text = (data.text || "").trim();

          if (!text) {
            const e = new Error(
              "PDF sans texte exploitable (scanné ? OCR nécessaire)",
            );
            e.status = 422;
            throw e;
          }

          return text;
        } finally {
          await parser.destroy();
        }
      }

      if (ext === ".docx") {
        const { value } = await mammoth.extractRawText({
          path: filePath,
        });

        const text = (value || "").trim();

        if (!text) {
          const e = new Error("DOCX vide ou illisible");
          e.status = 422;
          throw e;
        }

        return text;
      }

      const e = new Error("Format non supporté");
      e.status = 400;
      throw e;
    } catch (err) {
      if (err.status) {
        throw err;
      }

      console.error("Erreur lors de l'extraction du document :", err.message);

      const e = new Error("Extraction du texte échouée");
      e.status = 500;
      throw e;
    }
  },
};
