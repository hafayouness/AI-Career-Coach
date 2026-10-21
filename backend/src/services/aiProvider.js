import { getAIClient, aiConfig } from "../config/ai.js";

const cleanJson = (text) =>
  text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

export const aiProvider = {
  async chat({ system, user, json = false, temperature = 0.3 }) {
    const ai = getAIClient();

    try {
      const response = await ai.models.generateContent({
        model: aiConfig.model,
        contents: user,
        config: {
          systemInstruction: system,
          temperature,
          ...(json ? { responseMimeType: "application/json" } : {}),
        },
      });

      const content = response.text || "";

      if (json) {
        try {
          return JSON.parse(cleanJson(content));
        } catch {
          console.error("JSON IA invalide :", content.slice(0, 300));
          const e = new Error("Réponse IA non conforme (JSON invalide)");
          e.status = 502;
          throw e;
        }
      }
      return content;
    } catch (err) {
      if (err.status === 502) throw err;

      console.error("Erreur IA:", err.status, err.message);

      const e = new Error(
        err.status === 429
          ? "Quota IA dépassé, réessayez dans quelques instants"
          : "Fournisseur IA indisponible",
      );
      e.status = err.status === 429 ? 429 : 503;
      throw e;
    }
  },
};
