import { aiProvider } from "./aiProvider.js";

const SYSTEM_PROMPT = `Tu es un expert RH chargé d'analyser un CV.

RÈGLES ABSOLUES :
- N'invente JAMAIS d'information.
- Si une donnée est absente, mets null ou [].
- Ne déduis pas, n'extrapole pas, ne complète pas.
- Utilise uniquement le texte fourni.
- Réponds UNIQUEMENT en JSON valide.

FORMAT STRICT :
{
  "name": string|null,
  "email": string|null,
  "phone": string|null,
  "summary": string|null,
  "skills": string[],
  "experiences": [
    { "title": string, "company": string|null, "startDate": string|null, "endDate": string|null, "description": string }
  ],
  "education": [
    { "degree": string, "institution": string|null, "year": string|null }
  ],
  "languages": [
    { "language": string, "level": string|null }
  ],
  "certifications": string[],
  "projects": [
    { "name": string, "description": string }
  ]
}`;

export const cvAnalysisService = {
  async parseCV(rawText) {
    if (!rawText || rawText.trim().length < 50) {
      const e = new Error("Texte du CV trop court pour être analysé");
      e.status = 422;
      throw e;
    }

    const parsed = await aiProvider.chat({
      system: SYSTEM_PROMPT,
      user: `Voici le texte brut du CV :\n\n${rawText}`,
      json: true,
      temperature: 0.1,
    });

    return this.validateAndNormalize(parsed);
  },

  validateAndNormalize(data) {
    const arr = (v) => (Array.isArray(v) ? v : []);
    const str = (v) => (typeof v === "string" ? v.trim() : null);

    return {
      name: str(data.name),
      email: str(data.email),
      phone: str(data.phone),
      summary: str(data.summary),
      skills: arr(data.skills).filter((s) => typeof s === "string"),
      experiences: arr(data.experiences).map((e) => ({
        title: str(e.title) || "",
        company: str(e.company),
        startDate: str(e.startDate),
        endDate: str(e.endDate),
        description: str(e.description) || "",
      })),
      education: arr(data.education).map((e) => ({
        degree: str(e.degree) || "",
        institution: str(e.institution),
        year: str(e.year),
      })),
      languages: arr(data.languages).map((l) => ({
        language: str(l.language) || "",
        level: str(l.level),
      })),
      certifications: arr(data.certifications).filter(
        (c) => typeof c === "string",
      ),
      projects: arr(data.projects).map((p) => ({
        name: str(p.name) || "",
        description: str(p.description) || "",
      })),
    };
  },
};
