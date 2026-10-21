import { getAIClient, aiConfig } from "../config/ai.js";

export const aiProvider = {
  async chat({ system, user, json = false, temperature = 0.3 }) {
    const client = getAIClient();

    try {
      const response = await client.chat.completions.create({
        model: aiConfig.model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature,
        ...(json ? { response_format: { type: "json_object" } } : {}),
      });

      const content = response.choices?.[0]?.message?.content || "";

      if (json) {
        try {
          return JSON.parse(content);
        } catch {
          const e = new Error("Réponse IA non conforme (JSON invalide)");
          e.status = 502;
          throw e;
        }
      }
      return content;
    } catch (err) {
      if (err.status) throw err;
      console.error("Erreur IA:", err.message);
      const e = new Error("Fournisseur IA indisponible");
      e.status = 503;
      throw e;
    }
  },
};
