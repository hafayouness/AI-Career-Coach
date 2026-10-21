import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

console.log("Clé présente :", !!process.env.AI_API_KEY);
console.log("Modèle :", process.env.AI_MODEL);

const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });

try {
  const r = await ai.models.generateContent({
    model: process.env.AI_MODEL || "gemini-flash-latest",
    contents: "Réponds juste: OK",
  });
  console.log("Réponse :", r.text);
} catch (e) {
  console.error("Erreur :", e.status, e.message);
}
