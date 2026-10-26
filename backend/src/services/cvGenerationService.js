import { aiProvider } from "./aiProvider.js";

const SYSTEM_PROMPT = `Tu es un expert RH qui adapte un CV à une offre d'emploi précise.

RÈGLES ABSOLUES (prioritaires) :
- Tu ne peux utiliser QUE les informations présentes dans le CV fourni.
- Tu peux REFORMULER, RÉORGANISER, METTRE EN AVANT.
- Tu ne dois JAMAIS inventer : expérience, entreprise, diplôme, certification, compétence, langue, projet, technologie, responsabilité, résultat chiffré.
- Si une compétence est exigée par l'offre mais absente du CV, tu NE l'ajoutes PAS. Tu la signales dans "flaggedClaims".
- Chaque élément du contenu généré doit être traçable à une donnée réelle du CV.
- Réponds UNIQUEMENT en JSON valide.

FORMAT STRICT :
{
  "content": {
    "header": {
      "name": string,
      "email": string|null,
      "phone": string|null,
      "summary": string
    },
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
  },
  "changeSummary": {
    "reorganized": string[],
    "reformulated": string[],
    "highlighted": string[],
    "flaggedClaims": string[]
  }
}`;

export const cvGenerationService = {
  async generate(cvData, requirements, analysis) {
    if (!cvData) {
      const e = new Error("CV non analysé");
      e.status = 422;
      throw e;
    }

    const userPrompt = `CV original (données réelles extraites) :
${JSON.stringify(cvData, null, 2)}

Exigences de l'offre (référence) :
${JSON.stringify(requirements, null, 2)}

Analyse de correspondance (points forts et lacunes) :
${JSON.stringify(analysis, null, 2)}

Génère le CV adapté en respectant strictement les règles.`;

    const raw = await aiProvider.chat({
      system: SYSTEM_PROMPT,
      user: userPrompt,
      json: true,
      temperature: 0.2,
    });

    return this.validate(raw);
  },

  validate(data) {
    const arr = (v) => (Array.isArray(v) ? v : []);
    const str = (v) => (typeof v === "string" ? v.trim() : null);

    const content = data.content || {};
    const header = content.header || {};

    return {
      content: {
        header: {
          name: str(header.name) || "",
          email: str(header.email),
          phone: str(header.phone),
          summary: str(header.summary) || "",
        },
        skills: arr(content.skills).filter((s) => typeof s === "string"),
        experiences: arr(content.experiences).map((e) => ({
          title: str(e.title) || "",
          company: str(e.company),
          startDate: str(e.startDate),
          endDate: str(e.endDate),
          description: str(e.description) || "",
        })),
        education: arr(content.education).map((e) => ({
          degree: str(e.degree) || "",
          institution: str(e.institution),
          year: str(e.year),
        })),
        languages: arr(content.languages).map((l) => ({
          language: str(l.language) || "",
          level: str(l.level),
        })),
        certifications: arr(content.certifications).filter(
          (c) => typeof c === "string",
        ),
        projects: arr(content.projects).map((p) => ({
          name: str(p.name) || "",
          description: str(p.description) || "",
        })),
      },
      changeSummary: {
        reorganized: arr(data.changeSummary?.reorganized).filter(
          (s) => typeof s === "string",
        ),
        reformulated: arr(data.changeSummary?.reformulated).filter(
          (s) => typeof s === "string",
        ),
        highlighted: arr(data.changeSummary?.highlighted).filter(
          (s) => typeof s === "string",
        ),
        flaggedClaims: arr(data.changeSummary?.flaggedClaims).filter(
          (s) => typeof s === "string",
        ),
      },
    };
  },
};
