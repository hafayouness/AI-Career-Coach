import { aiProvider } from "./aiProvider.js";
import { InterviewSession } from "../models/index.js";

const SYSTEM_PROMPT = `Tu es un recruteur professionnel et exigeant. Tu fais passer un entretien d'embauche.
Tu dois poser UNE SEULE question à la fois.
Ne donne JAMAIS la réponse ou la correction immédiatement. Attends que le candidat réponde.
Pose des questions techniques et comportementales basées sur l'offre et le CV.

RÈGLES :
- Reste dans ton rôle de recruteur (ton direct, professionnel, parfois un peu challengeant).
- Si la réponse est vide ou incompréhensible, demande gentiment de reformuler.
- Après 4 ou 5 échanges (questions/réponses), tu conclus l'entretien en disant "Merci, cet entretien est terminé. Je vais maintenant préparer mon rapport."
- Ne génère pas de liste de questions. Juste la prochaine question ou réaction.

FORMAT DE SORTIE (JSON) :
{
  "message": "Le texte que le recruteur dit à voix haute",
  "isFinished": boolean (true si l'entretien est terminé)
}`;

export const interviewSimulationService = {
  async start(userId, { cvId, jobOfferId, cvData, offerData }) {
    const session = await InterviewSession.create({
      userId,
      cvId,
      jobOfferId,
      mode: "real",
      history: [
        {
          role: "system",
          content: `CV: ${JSON.stringify(cvData)}\nOffre: ${JSON.stringify(offerData)}`,
        },
      ],
    });

    // 2. Générer la première question (accueil + première question)
    const initialPrompt =
      "Démarre l'entretien en saluant le candidat et en posant ta première question (ex: Parlez-moi de vous).";

    const response = await aiProvider.chat({
      system: SYSTEM_PROMPT,
      user: initialPrompt,
      json: true,
      temperature: 0.6,
    });

    const history = [
      ...session.history,
      { role: "assistant", content: response.message },
    ];
    await session.update({ history });

    return { session, message: response.message };
  },

  async answer(userId, sessionId, userAnswer) {
    const session = await InterviewSession.findOne({
      where: { id: sessionId, userId },
    });
    if (!session)
      throw Object.assign(new Error("Session introuvable"), { status: 404 });
    if (session.status === "completed")
      throw Object.assign(new Error("Entretien déjà terminé"), { status: 400 });

    const newHistory = [
      ...session.history,
      { role: "user", content: userAnswer },
    ];

    const response = await aiProvider.chat({
      system: SYSTEM_PROMPT,
      user: `Historique : ${JSON.stringify(newHistory)}\n\nRéagis à la dernière réponse du candidat et pose la question suivante.`,
      json: true,
      temperature: 0.6,
    });

    // 3. Sauvegarder
    newHistory.push({ role: "assistant", content: response.message });
    await session.update({
      history: newHistory,
      status: response.isFinished ? "completed" : "in_progress",
    });

    return { message: response.message, isFinished: response.isFinished };
  },

  async finishAndGenerateReport(userId, sessionId) {
    const session = await InterviewSession.findOne({
      where: { id: sessionId, userId },
    });
    if (!session)
      throw Object.assign(new Error("Session introuvable"), { status: 404 });

    const reportPrompt = `Voici l'historique complet de l'entretien : ${JSON.stringify(session.history)}.
Génère un rapport d'évaluation final.
FORMAT JSON :
{
  "overallScore": number (0-100),
  "strengths": ["..."],
  "weaknesses": ["..."],
  "advice": "Conseil global pour s'améliorer."
}`;

    const report = await aiProvider.chat({
      system:
        "Tu es un expert RH. Analyse cet entretien et génère un rapport structuré.",
      user: reportPrompt,
      json: true,
    });

    await session.update({ report, status: "completed" });
    return session;
  },
};
