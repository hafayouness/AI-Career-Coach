import { aiProvider } from "./aiProvider.js";

const SYSTEM_PROMPT = `Tu es un expert RH chargé de comparer un CV et une offre d'emploi.

RÈGLES ABSOLUES (prioritaires sur tout) :
- N'invente JAMAIS de compétence, d'expérience, de diplôme ou de langue absente du CV.
- Chaque correspondance doit être justifiée par une donnée réelle du CV.
- Chaque lacune doit être une exigence RÉELLE de l'offre non trouvée dans le CV.
- Ne prétends PAS prédire la probabilité d'embauche.
- Ne donne PAS de score sans justification.
- Sois factuel, précis, sans flatterie ni exagération.
- Réponds UNIQUEMENT en JSON valide, sans texte autour.

FORMAT STRICT :
{
  "matchingScore": number (0-100),
  "matchedSkills": string[],
  "missingSkills": string[],
  "matchedRequirements": [
    { "requirement": string, "evidence": string }
  ],
  "missingRequirements": [
    { "requirement": string, "reason": string }
  ],
  "relevantExperiences": [
    { "title": string, "company": string|null, "relevance": string }
  ],
  "strengths": string[],
  "gaps": string[],
  "recommendations": string[],
  "atsKeywords": string[]
}`;

export const matchingAnalysisService = {
  async analyze(cv, offer) {
    if (!cv.parsedData) {
      const e = new Error("Le CV n'a pas encore été analysé");
      e.status = 422;
      throw e;
    }
    if (!offer.requirements) {
      const e = new Error("L'offre n'a pas encore été analysée");
      e.status = 422;
      throw e;
    }

    const userPrompt = this.buildPrompt(cv.parsedData, offer.requirements);

    const raw = await aiProvider.chat({
      system: SYSTEM_PROMPT,
      user: userPrompt,
      json: true,
      temperature: 0.2,
    });

    return this.validateAndNormalize(raw);
  },

  buildPrompt(cvData, requirements) {
    return `Voici les données structurées du CV (extraites réellement) :
${JSON.stringify(cvData, null, 2)}

Voici les exigences de l'offre (extraites réellement) :
${JSON.stringify(requirements, null, 2)}

Compare-les et produis l'analyse JSON demandée.`;
  },

  validateAndNormalize(data) {
    const arr = (v) => (Array.isArray(v) ? v : []);
    const str = (v) => (typeof v === "string" ? v.trim() : null);
    const num = (v) => {
      const n = Number(v);
      if (!Number.isFinite(n)) return 0;
      return Math.max(0, Math.min(100, Math.round(n)));
    };

    return {
      matchingScore: num(data.matchingScore),

      matchedSkills: arr(data.matchedSkills).filter(
        (s) => typeof s === "string",
      ),
      missingSkills: arr(data.missingSkills).filter(
        (s) => typeof s === "string",
      ),

      matchedRequirements: arr(data.matchedRequirements)
        .map((r) => ({
          requirement: str(r.requirement) || "",
          evidence: str(r.evidence) || "",
        }))
        .filter((r) => r.requirement && r.evidence),

      missingRequirements: arr(data.missingRequirements)
        .map((r) => ({
          requirement: str(r.requirement) || "",
          reason: str(r.reason) || "Absent du CV",
        }))
        .filter((r) => r.requirement),

      relevantExperiences: arr(data.relevantExperiences)
        .map((e) => ({
          title: str(e.title) || "",
          company: str(e.company),
          relevance: str(e.relevance) || "",
        }))
        .filter((e) => e.title),

      strengths: arr(data.strengths).filter((s) => typeof s === "string"),
      gaps: arr(data.gaps).filter((s) => typeof s === "string"),
      recommendations: arr(data.recommendations).filter(
        (s) => typeof s === "string",
      ),
      atsKeywords: arr(data.atsKeywords).filter((s) => typeof s === "string"),
    };
  },
};
