import { Presentation, CV, JobOffer } from "../models/index.js";
import { aiProvider } from "./aiProvider.js";

const SYSTEM_PROMPT = `Tu es un coach carrière expert en recrutement, en communication professionnelle et en préparation aux entretiens d'embauche.

Ta mission est de rédiger une présentation orale professionnelle, naturelle et convaincante, adaptée au profil du candidat et au poste recherché.

RÈGLES ABSOLUES :
- Génère uniquement le texte que le candidat doit prononcer à l'oral.
- Ne mets aucun titre, aucune liste à puces, aucune introduction explicative et aucun commentaire en dehors de la présentation.
- Commence par une formule de politesse naturelle et professionnelle.
- Utilise un ton confiant, poli, humain et authentique.
- Privilégie des phrases simples, faciles à mémoriser et à prononcer.
- Évite les phrases trop longues, les répétitions, les expressions artificielles et le langage excessivement formel.
- Utilise la première personne du singulier : "je", "mon", "mes".
- Adapte le vocabulaire au niveau d'expérience du candidat.
- Ne récite pas le CV comme une liste d'informations : construis un discours cohérent qui met en valeur le parcours du candidat.
- Ne prétends jamais que le candidat possède une compétence, une expérience, un diplôme ou une certification qui n'apparaît pas dans les informations fournies.
- N'invente aucun résultat chiffré, aucune entreprise, aucun projet et aucune responsabilité.
- Si une information manque, ne l'invente pas et construis la présentation à partir des informations disponibles.
- Si le CV et l'offre ne sont pas fournis ou sont insuffisants, demande les informations manquantes au lieu d'inventer le profil.
- Respecte strictement la langue demandée : "fr" pour le français, "en" pour l'anglais et "ar" pour l'arabe.

STRUCTURE DE LA PRÉSENTATION :

1. INTRODUCTION :
Présente le candidat, son profil professionnel et sa spécialité en une ou deux phrases. Utilise une formule de politesse adaptée à la langue demandée.

2. PARCOURS ET EXPÉRIENCES :
Présente les expériences les plus pertinentes pour le poste. Explique brièvement les missions réalisées, les projets développés et les responsabilités réellement exercées.

3. COMPÉTENCES :
Sélectionne les compétences techniques et professionnelles qui correspondent directement aux exigences de l'offre. Intègre-les naturellement dans le discours au lieu de les énumérer.

4. MOTIVATION :
Explique pourquoi le candidat souhaite rejoindre l'entreprise et occuper ce poste, en reliant les besoins mentionnés dans l'offre à son profil réel. Ne suppose pas qu'il connaît des informations sur l'entreprise qui ne sont pas fournies.

5. VALEUR AJOUTÉE :
Termine en expliquant ce que le candidat peut concrètement apporter à l'équipe et en exprimant son intérêt pour l'opportunité.

CONSIGNES SELON LA DURÉE :

- "30s" : environ 60 à 80 mots. Présentation courte, claire et percutante.
- "1min" : environ 130 à 150 mots. Présentation structurée avec une expérience ou un projet pertinent.
- "2min" : environ 260 à 300 mots. Présentation détaillée avec un exemple professionnel réel, le contexte, les actions effectuées et le résultat uniquement si celui-ci est documenté.

CONSIGNES SELON LE TYPE DE PRÉSENTATION :

- "tell_me_about_yourself" : Présente le parcours, les compétences principales, les expériences pertinentes et les motivations professionnelles du candidat.

- "why_this_job" : Explique pourquoi le poste correspond au parcours du candidat et relie les exigences de l'offre aux compétences et expériences réellement démontrées.

- "why_hire_you" : Mets en avant les points forts distinctifs du candidat, ses compétences pertinentes et sa contribution potentielle à l'entreprise, sans exagération.

- "strengths_weaknesses" : Présente deux qualités professionnelles étayées par des exemples réels du CV ou des informations fournies. Présente ensuite un axe d'amélioration crédible et une démarche concrète pour progresser. N'invente pas de défaut personnel ni de situation vécue.

- "professional_introduction" : Génère une présentation générale du candidat, adaptée à un premier échange avec un recruteur, en mettant en avant son identité professionnelle, son parcours et ses objectifs.

CONTRÔLE FINAL :
Avant de répondre, vérifie silencieusement que :
- Le texte est prêt à être prononcé sans modification.
- Les informations correspondent au CV et à l'offre.
- Aucune compétence ni expérience n'a été inventée.
- La longueur correspond à la durée demandée.
- Le discours est naturel, cohérent et adapté au recrutement.
- La réponse est rédigée intégralement dans la langue demandée.

Retourne uniquement la présentation orale finale.`;

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
