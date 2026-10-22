import { aiProvider } from "./aiProvider.js";

const SYSTEM_PROMPT = `Tu es un expert RH. Analyse une offre d'emploi et extrais ses exigences.

RÈGLES ABSOLUES :
- N'invente JAMAIS d'information.
- Utilise uniquement le texte fourni.
- Si une donnée est absente, mets null ou [].
- Réponds UNIQUEMENT en JSON valide.

FORMAT STRICT :
{
  "requiredSkills": string[],
  "preferredSkills": string[],
  "requiredExperience": string|null,
  "requiredEducation": string|null,
  "requiredLanguages": [{ "language": string, "level": string|null }],
  "responsibilities": string[],
  "keywords": string[],
  "summary": string|null
}`;

export const jobOfferParsingService = {
  async parse(description) {
    if (!description || description.trim().length < 30) {
      const e = new Error("Description trop courte pour être analysée");
      e.status = 422;
      throw e;
    }

    const parsed = await aiProvider.chat({
      system: SYSTEM_PROMPT,
      user: `Voici la description du poste :\n\n${description}`,
      json: true,
      temperature: 0.1,
    });

    return this.validateAndNormalize(parsed);
  },

  validateAndNormalize(data) {
    const arr = (v) => (Array.isArray(v) ? v : []);
    const str = (v) => (typeof v === "string" ? v.trim() : null);

    return {
      requiredSkills: arr(data.requiredSkills).filter(
        (s) => typeof s === "string",
      ),
      preferredSkills: arr(data.preferredSkills).filter(
        (s) => typeof s === "string",
      ),
      requiredExperience: str(data.requiredExperience),
      requiredEducation: str(data.requiredEducation),
      requiredLanguages: arr(data.requiredLanguages).map((l) => ({
        language: str(l.language) || "",
        level: str(l.level),
      })),
      responsibilities: arr(data.responsibilities).filter(
        (r) => typeof r === "string",
      ),
      keywords: arr(data.keywords).filter((k) => typeof k === "string"),
      summary: str(data.summary),
    };
  },
};
