import { getAIClient, aiConfig } from "../config/ai.js";

const cleanJson = (text) =>
  text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Erreurs temporaires : ça vaut le coup de réessayer
const isRetryable = (err) => [429, 500, 503, 504].includes(err.status);

async function generate(ai, model, { system, user, json, temperature }) {
  const response = await ai.models.generateContent({
    model,
    contents: user,
    config: {
      systemInstruction: system,
      temperature,
      ...(json ? { responseMimeType: "application/json" } : {}),
    },
  });
  return response.text || "";
}

// Réessaie un même modèle avec une pause qui double (1s, 2s, 4s)
async function withRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (!isRetryable(err) || i === retries - 1) throw err;
      const wait = 1000 * 2 ** i + Math.random() * 300; // + un peu de hasard
      console.warn(`IA ${err.status}, nouvel essai dans ${Math.round(wait)}ms`);
      await sleep(wait);
    }
  }
}

export const aiProvider = {
  async chat({ system, user, json = false, temperature = 0.3 }) {
    const ai = getAIClient();
    const params = { system, user, json, temperature };

    // Modèle principal, puis modèle de secours s'il est configuré
    const models = [aiConfig.model, aiConfig.fallbackModel].filter(Boolean);

    try {
      let content;
      let lastErr;

      for (const model of models) {
        try {
          content = await withRetry(() => generate(ai, model, params));
          lastErr = null;
          break;
        } catch (err) {
          lastErr = err;
          if (!isRetryable(err)) throw err; // inutile de changer de modèle
          console.warn(`Modèle ${model} indisponible, bascule sur le suivant`);
        }
      }
      if (lastErr) throw lastErr;

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
