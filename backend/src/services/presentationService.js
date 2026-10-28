import { Presentation, CV, JobOffer } from "../models/index.js";
import { aiProvider } from "./aiProvider.js";

const SYSTEM_PROMPT = `Tu es un coach carrière expert. Tu génères des présentations professionnelles personnalisées (pitchs) pour des entretiens.

RÈGLES ABSOLUES :
- Base-toi UNIQUEMENT sur le CV et l'offre fournis.
- N'invente AUCUNE expérience, compétence ou réalisation.
- Adapte le ton : confiant, professionnel, naturel.
- Pour la langue "en", réponds en anglais. Pour "ar", en arabe. Pour "fr", en français.
- La réponse doit être un texte fluide, prêt à être prononcé à l'oral.
- Ne mets PAS de titres, de balises ou de formatage Markdown. Juste le texte.`;

export const presentationService = {
  async generate(userId, { cvId, jobOfferId, language, type }) {
    const [cv, offer] = await Promise.all([
      CV.findOne({ where: { id: cvId, userId } }),
      JobOffer.findOne({ where: { id: jobOfferId, userId } }),
    ]);

    if (!cv || !offer)
      throw Object.assign(new Error("CV ou offre introuvable"), {
        status: 404,
      });

    let instruction = "";
    switch (type) {
      case "30s":
        instruction =
          "Génère une présentation de 30 secondes (environ 60-80 mots). Sois percutant et direct.";
        break;
      case "1min":
        instruction =
          "Génère une présentation de 1 minute (environ 130-150 mots). Développe un peu plus tes compétences clés.";
        break;
      case "2min":
        instruction =
          "Génère une présentation de 2 minutes (environ 260-300 mots). Sois détaillé, raconte une mini-histoire professionnelle.";
        break;
      case "tell_me_about_yourself":
        instruction =
          'Réponds à la question "Parlez-moi de vous". Mets en avant ton parcours et tes compétences clés.';
        break;
      case "why_this_job":
        instruction =
          "Réponds à la question \"Pourquoi ce poste ?\". Montre ton intérêt pour l'entreprise et l'adéquation avec le poste.";
        break;
      case "why_hire_you":
        instruction =
          'Réponds à la question "Pourquoi vous recruter ?". Mets en avant ta valeur ajoutée unique.';
        break;
      case "strengths_weaknesses":
        instruction =
          "Réponds à la question sur tes forces et axes d'amélioration. Sois honnête et montre comment tu travailles sur tes faiblesses.";
        break;
      default:
        instruction = "Génère une présentation professionnelle.";
    }

    const userPrompt = `CV (données réelles) :
${JSON.stringify(cv.parsedData, null, 2)}

Offre ciblée :
${JSON.stringify(offer.requirements, null, 2)}

Instruction : ${instruction}
Langue : ${language}`;

    const content = await aiProvider.chat({
      system: SYSTEM_PROMPT,
      user: userPrompt,
      json: false,
      temperature: 0.6,
    });

    return Presentation.create({
      userId,
      cvId,
      jobOfferId,
      language,
      type,
      content: content.trim(),
    });
  },

  async list(userId) {
    return Presentation.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      include: [
        { model: CV, as: "cv", attributes: ["id", "originalFileName"] },
        {
          model: JobOffer,
          as: "jobOffer",
          attributes: ["id", "title", "company"],
        },
      ],
    });
  },

  async get(userId, id) {
    const p = await Presentation.findOne({ where: { id, userId } });
    if (!p)
      throw Object.assign(new Error("Présentation introuvable"), {
        status: 404,
      });
    return p;
  },

  async update(userId, id, content) {
    const p = await this.get(userId, id);
    await p.update({ content });
    return p;
  },

  async remove(userId, id) {
    const p = await this.get(userId, id);
    await p.destroy();
  },
};
