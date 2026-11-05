import { GoogleGenAI } from "@google/genai";
import { env } from "./env.js";

let client = null;

export const getAIClient = () => {
  if (!env.aiApiKey) {
    const e = new Error(
      "AI_API_KEY manquante — impossible d'appeler le fournisseur IA",
    );
    e.status = 503;
    throw e;
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: env.aiApiKey });
  }
  return client;
};

export const aiConfig = {
  provider: env.aiProvider,
  model: env.aiModel || "gemini-3.5-flash-lite",
  fallbackModel: env.aiFallbackModel || "gemini-3.1-flash-lite",
};
