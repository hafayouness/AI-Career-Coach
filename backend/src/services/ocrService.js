import Tesseract from "tesseract.js";

export const ocrService = {
  /**
   * OCR sur une image (JPG/PNG) → texte brut
   * Langues : français + anglais
   */
  async extractTextFromImage(imagePath) {
    try {
      const { data } = await Tesseract.recognize(imagePath, "fra+eng", {
        logger: () => {}, // silencieux
      });

      const text = (data.text || "").trim();

      if (!text || text.length < 30) {
        const e = new Error(
          "Aucun texte exploitable détecté dans l'image. Vérifiez la qualité de la capture.",
        );
        e.status = 422;
        throw e;
      }

      return text;
    } catch (err) {
      if (err.status) throw err;
      console.error("OCR échoué:", err.message);
      const e = new Error("Échec de la lecture OCR de l'image");
      e.status = 500;
      throw e;
    }
  },
};
