import { aiProvider } from "./aiProvider.js";

const SYSTEM_PROMPT = `Tu es un expert RH. On te fournit le texte brut extrait par OCR d'une capture d'écran d'une offre d'emploi (LinkedIn, Indeed, etc.).

RÈGLES ABSOLUES :
- N'invente RIEN. Utilise uniquement le texte fourni.
- Ignore les éléments parasites de l'interface (boutons "Postuler", "Enregistrer", menus, publicités).
- Si une information est absente, mets null.
- Réponds UNIQUEMENT en JSON valide.

FORMAT STRICT :
{
  "title": string|null,
  "company": string|null,
  "location": string|null,
  "description": string,
  "requiredSkills": string[],
  "preferredSkills": string[],
  "requiredExperience": string|null,
  "requiredEducation": string|null,
  "keywords": string[]
}

Pour "description", reconstitue le texte de l'offre tel qu'il apparaît (sans les éléments d'UI).`;

export const jobOfferExtractionService = {
  async extractFromRawText(rawText) {
    const parsed = await aiProvider.chat({
      system: SYSTEM_PROMPT,
      user: `Voici le texte OCR brut de la capture d'écran :\n\n${rawText}`,
      json: true,
      temperature: 0.1,
    });

    return this.validateAndNormalize(parsed, rawText);
  },

  validateAndNormalize(data, fallbackDescription) {
    const arr = (v) => (Array.isArray(v) ? v : []);
    const str = (v) => (typeof v === "string" ? v.trim() : null);

    return {
      title: str(data.title) || "Offre importée",
      company: str(data.company),
      location: str(data.location),
      description: str(data.description) || fallbackDescription.slice(0, 5000),
      requirements: {
        requiredSkills: arr(data.requiredSkills).filter(
          (s) => typeof s === "string",
        ),
        preferredSkills: arr(data.preferredSkills).filter(
          (s) => typeof s === "string",
        ),
        requiredExperience: str(data.requiredExperience),
        requiredEducation: str(data.requiredEducation),
        requiredLanguages: [],
        responsibilities: [],
        keywords: arr(data.keywords).filter((k) => typeof k === "string"),
        summary: null,
      },
    };
  },
};
