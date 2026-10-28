import { aiProvider } from "./aiProvider.js";

/* =====================================================
   TRI DÉTERMINISTE
   ===================================================== */
function sortSkillsByRelevance(skillsArray, requiredSkills, preferredSkills) {
  const req = requiredSkills.map((s) => s.toLowerCase());
  const pref = preferredSkills.map((s) => s.toLowerCase());
  const score = (skill) => {
    const l = skill.toLowerCase();
    if (req.includes(l)) return 0;
    if (pref.includes(l)) return 1;
    return 2;
  };
  return [...skillsArray].sort((a, b) => score(a) - score(b));
}

function sortExperiencesByRelevance(
  experiences,
  requiredSkills,
  preferredSkills,
) {
  const keywords = [...requiredSkills, ...preferredSkills].map((s) =>
    s.toLowerCase(),
  );
  const matches = (exp) => {
    const haystack =
      `${exp.title_and_company || ""} ${exp.context || ""} ${exp.missions?.join(" ") || ""}`.toLowerCase();
    return keywords.some((k) => k && haystack.includes(k));
  };
  const year = (d) => {
    if (!d) return 0;
    const m = String(d).match(/\d{4}/);
    return m ? parseInt(m[0], 10) : 0;
  };
  return [...experiences].sort((a, b) => {
    const aM = matches(a) ? 1 : 0;
    const bM = matches(b) ? 1 : 0;
    if (aM !== bM) return bM - aM;
    return year(b.dates) - year(a.dates);
  });
}

/* =====================================================
   PROMPT — RÉDACTEUR EXPERT
   ===================================================== */
const SYSTEM_PROMPT = `Tu es un Rédacteur Professionnel de CV de haut niveau (spécialisé dans la tech) et un expert RH.
Ta mission : Transformer le CV fourni en un document ultra-professionnel, percutant et orienté vers les résultats, tout en ciblant l'offre d'emploi.

RÈGLES DE RÉDACTION (CRITIQUE - NIVEAU EXPERT) :
- **Verbes d'action forts** : Commence CHAQUE puce par un verbe d'action professionnel (ex: "Développé", "Conçu", "Optimisé", "Implémenté", "Sécurisé", "Automatisé"). Bannis "J'ai fait", "J'ai participé", "J'ai aidé".
- **Vocabulaire technique et précis** : Utilise les termes exacts de l'industrie (ex: "architecture REST", "composants réutilisables", "requêtes optimisées", "middleware de sécurité").
- **Orienté résultats** : Chaque mission doit montrer l'impact. N'invente AUCUN chiffre si le CV n'en contient pas.
- **Fidélité absolue** : N'invente AUCUNE technologie, AUCUNE expérience.
- **Séparation stricte** : Ne fusionne JAMAIS deux puces. Si le CV original a 3 puces, génère 3 puces.
- **Résumé** : Rédige un paragraphe de 3 lignes max, digne d'un profil LinkedIn, ultra-professionnel.

FORMAT STRICT DE SORTIE (JSON) :
{
  "content": {
    "header": {
      "name": "NOM PRENOM",
      "email": "email",
      "phone": "telephone",
      "summary": "Développeur [Spécialité] expert en [Compétences clés de l'offre], passionné par [Domaine]. Fort d'une expérience en [Contexte], je conçois des solutions [Adjectifs forts]."
    },
    "skills": {
      "langages": ["..."],
      "frameworks": ["..."],
      "outils": ["..."],
      "methodologies": ["..."]
    },
    "experiences": [
      {
        "title_and_company": "Entreprise : Poste (stack)",
        "dates": "Novembre 2024 – Avril 2025",
        "context": "Conception et développement d'une application complète...",
        "missions": [
          "Développement d'API sécurisées avec Laravel (architecture MVC, authentification JWT, validation stricte).",
          "Création d'interfaces dynamiques et réactives en React.js (gestion d'état Redux, formulaires complexes).",
          "Optimisation de l'intégration des API REST et amélioration continue des performances."
        ],
        "result": "Application déployée avec succès, réduisant les erreurs humaines."
      }
    ],
    "projects": [
      {
        "name": "Nom du projet",
        "dates": "24/11/25",
        "missions": [
          "Implémentation d'une API REST robuste en Express.js.",
          "Conception de la gestion des utilisateurs (inscription, rôles, hachage sécurisé).",
          "Écriture de tests Postman pour garantir la fiabilité."
        ],
        "result": "API sécurisée et fiable, prête pour la production."
      }
    ],
    "education": [
      {
        "title": "École – Formation | Lieu",
        "dates": "sept. 2025 – Présent.",
        "details": [
          "Formation intensive d'élite en développement mobile et web.",
          "Développement de projets full-stack.",
          "Maîtrise des concepts avancés : gestion d'état, animations, consommation d'API."
        ]
      }
    ],
    "languages": "Français : bilingue professionnel | Anglais : technique | Arabe : natif"
  },
  "changeSummary": {
    "reorganized": [],
    "reformulated": [],
    "highlighted": [],
    "flaggedClaims": []
  }
}`;

export const cvGenerationService = {
  async generate(cvData, requirements, analysis) {
    if (!cvData)
      throw Object.assign(new Error("CV non analysé"), { status: 422 });

    const requiredSkills = requirements?.requiredSkills ?? [];
    const preferredSkills = requirements?.preferredSkills ?? [];

    const userPrompt = `CV original (données réelles) :
${JSON.stringify(cvData, null, 2)}

Exigences de l'offre :
${JSON.stringify(requirements, null, 2)}

Génère le CV adapté en respectant EXACTEMENT la structure demandée. Rends le texte percutant et professionnel.`;

    const raw = await aiProvider.chat({
      system: SYSTEM_PROMPT,
      user: userPrompt,
      json: true,
      temperature: 0.2,
    });

    const validated = this.validate(raw);

    // Tri automatique
    if (validated.content.skills) {
      validated.content.skills.langages = sortSkillsByRelevance(
        validated.content.skills.langages || [],
        requiredSkills,
        preferredSkills,
      );
      validated.content.skills.frameworks = sortSkillsByRelevance(
        validated.content.skills.frameworks || [],
        requiredSkills,
        preferredSkills,
      );
      validated.content.skills.outils = sortSkillsByRelevance(
        validated.content.skills.outils || [],
        requiredSkills,
        preferredSkills,
      );
      validated.content.skills.methodologies = sortSkillsByRelevance(
        validated.content.skills.methodologies || [],
        requiredSkills,
        preferredSkills,
      );
    }
    validated.content.experiences = sortExperiencesByRelevance(
      validated.content.experiences || [],
      requiredSkills,
      preferredSkills,
    );

    return validated;
  },

  validate(data) {
    const arr = (v) => (Array.isArray(v) ? v : []);
    const str = (v) => (typeof v === "string" ? v.trim() : "");
    const strOrNull = (v) => (v ? String(v).trim() : null);

    const content = data?.content || {};
    const header = content.header || {};

    return {
      content: {
        header: {
          name: str(header.name) || "CV adapté",
          email: strOrNull(header.email),
          phone: strOrNull(header.phone),
          summary: str(header.summary),
        },
        skills: {
          langages: arr(content.skills?.langages).filter(Boolean),
          frameworks: arr(content.skills?.frameworks).filter(Boolean),
          outils: arr(content.skills?.outils).filter(Boolean),
          methodologies: arr(content.skills?.methodologies).filter(Boolean),
        },
        experiences: arr(content.experiences).map((e) => ({
          title_and_company: str(e?.title_and_company),
          dates: str(e?.dates),
          context: str(e?.context),
          missions: arr(e?.missions)
            .map((m) => str(m))
            .filter(Boolean),
          result: str(e?.result),
        })),
        projects: arr(content.projects).map((p) => ({
          name: str(p?.name),
          dates: str(p?.dates),
          missions: arr(p?.missions)
            .map((m) => str(m))
            .filter(Boolean),
          result: str(p?.result),
        })),
        education: arr(content.education).map((e) => ({
          title: str(e?.title),
          dates: str(e?.dates),
          details: arr(e?.details)
            .map((d) => str(d))
            .filter(Boolean),
        })),
        languages: str(content.languages),
      },
      changeSummary: {
        reorganized: arr(data?.changeSummary?.reorganized).filter(
          (s) => typeof s === "string",
        ),
        reformulated: arr(data?.changeSummary?.reformulated).filter(
          (s) => typeof s === "string",
        ),
        highlighted: arr(data?.changeSummary?.highlighted).filter(
          (s) => typeof s === "string",
        ),
        flaggedClaims: arr(data?.changeSummary?.flaggedClaims).filter(
          (s) => typeof s === "string",
        ),
      },
    };
  },
};
