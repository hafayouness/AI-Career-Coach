import { InterviewQuestion, CV, JobOffer } from "../models/index.js";
import { aiProvider } from "./aiProvider.js";

const SYSTEM_PROMPT = `Tu es un recruteur technique et RH expert. Tu prépares un candidat à son entretien.
À partir du CV et de l'offre fournis, génère une liste de questions d'entretien.

RÈGLES ABSOLUES :
- Base-toi UNIQUEMENT sur le CV et l'offre.
- N'invente AUCUNE expérience.
- Réponds UNIQUEMENT en JSON valide.

FORMAT STRICT (Tableau de questions) :
{
  "questions": [
    {
      "category": "RH" | "Technique" | "Comportemental" | "Projet",
      "questionText": "La question posée par le recruteur",
      "objective": "Pourquoi le recruteur pose cette question",
      "method": "Comment y répondre (ex: utiliser la méthode STAR, être honnête, donner un exemple concret)",
      "exampleAnswer": "Un exemple de bonne réponse basé sur le CV (à la première personne)",
      "mistakesToAvoid": "Ce qu'il ne faut pas dire"
    }
  ]
}`;

export const interviewQuestionService = {
  async generate(userId, { cvId, jobOfferId, categories }) {
    const [cv, offer] = await Promise.all([
      CV.findOne({ where: { id: cvId, userId } }),
      JobOffer.findOne({ where: { id: jobOfferId, userId } }),
    ]);

    if (!cv || !offer)
      throw Object.assign(new Error("CV ou offre introuvable"), {
        status: 404,
      });

    const userPrompt = `CV : ${JSON.stringify(cv.parsedData)}
Offre : ${JSON.stringify(offer.requirements)}
Génère 2 questions pour chacune de ces catégories : ${categories.join(", ")}.`;

    const raw = await aiProvider.chat({
      system: SYSTEM_PROMPT,
      user: userPrompt,
      json: true,
      temperature: 0.5,
    });

    const questionsData = raw.questions || [];

    const saved = await Promise.all(
      questionsData.map((q) =>
        InterviewQuestion.create({
          userId,
          cvId,
          jobOfferId,
          category: q.category,
          questionText: q.questionText,
          objective: q.objective,
          method: q.method,
          exampleAnswer: q.exampleAnswer,
          mistakesToAvoid: q.mistakesToAvoid,
        }),
      ),
    );

    return saved;
  },

  async list(userId) {
    return InterviewQuestion.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      include: [
        { model: JobOffer, as: "jobOffer", attributes: ["title", "company"] },
      ],
    });
  },

  async remove(userId, id) {
    const q = await InterviewQuestion.findOne({ where: { id, userId } });
    if (!q)
      throw Object.assign(new Error("Question introuvable"), { status: 404 });
    await q.destroy();
  },
};
