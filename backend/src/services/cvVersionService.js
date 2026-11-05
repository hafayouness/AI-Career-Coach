import { CVVersion, CV, JobOffer, JobAnalysis } from "../models/index.js";
import { cvGenerationService } from "./cvGenerationService.js";
import { antiInventionService } from "./antiInventionService.js";

export const cvVersionService = {
  async generate(userId, cvId, jobOfferId) {
    const [cv, offer, analysis] = await Promise.all([
      CV.findOne({ where: { id: cvId, userId } }),
      JobOffer.findOne({ where: { id: jobOfferId, userId } }),
      JobAnalysis.findOne({ where: { cvId, jobOfferId, userId } }),
    ]);

    if (!cv) {
      const e = new Error("CV introuvable");
      e.status = 404;
      throw e;
    }
    if (!offer) {
      const e = new Error("Offre introuvable");
      e.status = 404;
      throw e;
    }
    if (!analysis) {
      const e = new Error("Lancez d'abord une analyse de correspondance");
      e.status = 422;
      throw e;
    }
    if (cv.processingStatus !== "completed") {
      const e = new Error("Le CV n'est pas encore analysé");
      e.status = 422;
      throw e;
    }

    const generated = await cvGenerationService.generate(
      cv.parsedData,
      offer.requirements,
      analysis.matchingDetails,
    );

    const check = antiInventionService.check(generated.content, cv.parsedData);

    const flaggedClaims = [
      ...(generated.changeSummary.flaggedClaims || []),
      ...check.issues.map((i) => `${i.type}: ${i.value} — ${i.reason}`),
    ];

    const lastVersion = await CVVersion.findOne({
      where: { cvId, jobOfferId },
      order: [["versionNumber", "DESC"]],
    });
    const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

    return CVVersion.create({
      cvId,
      jobOfferId,
      versionNumber,
      content: generated.content,
      changeSummary: {
        ...generated.changeSummary,
        flaggedClaims,
        antiInventionIssues: check.issues,
      },
      validated: false,
    });
  },

  async list(userId, cvId) {
    const cv = await CV.findOne({ where: { id: cvId, userId } });
    if (!cv) {
      const e = new Error("CV introuvable");
      e.status = 404;
      throw e;
    }

    return CVVersion.findAll({
      where: { cvId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: JobOffer,
          as: "jobOffer",
          attributes: ["id", "title", "company", "location"],
        },
      ],
    });
  },

  async listAll(userId) {
    return CVVersion.findAll({
      include: [
        {
          model: CV,
          as: "cv",
          where: { userId },
          attributes: ["id", "originalFileName"],
        },
        {
          model: JobOffer,
          as: "jobOffer",
          attributes: ["id", "title", "company"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  },

  async get(userId, id) {
    const version = await CVVersion.findOne({
      where: { id },
      include: [
        {
          model: CV,
          as: "cv",
          where: { userId },
          attributes: ["id", "originalFileName", "parsedData"],
        },
        {
          model: JobOffer,
          as: "jobOffer",
          attributes: ["id", "title", "company", "location"],
        },
      ],
    });
    if (!version) {
      const e = new Error("Version introuvable");
      e.status = 404;
      throw e;
    }
    return version;
  },

  async update(userId, id, content) {
    const version = await this.get(userId, id);
    if (version.validated) {
      const e = new Error("Impossible de modifier une version validée");
      e.status = 409;
      throw e;
    }
    await version.update({ content });
    return version;
  },

  async validate(userId, id) {
    const version = await this.get(userId, id);
    await version.update({ validated: true, validatedAt: new Date() });
    return version;
  },

  async remove(userId, id) {
    const version = await this.get(userId, id);
    await version.destroy();
  },
  async getGaps(userId, versionId) {
    const version = await this.get(userId, versionId);

    // Récupérer le CV original et l'offre
    const cv = await CV.findOne({ where: { id: version.cvId, userId } });
    const offer = await JobOffer.findOne({
      where: { id: version.jobOfferId, userId },
    });

    if (!cv || !offer)
      throw Object.assign(new Error("Données introuvables"), { status: 404 });

    const cvData = cv.parsedData || {};
    const requirements = offer.requirements || {};
    const requiredSkills = requirements.requiredSkills || [];
    const preferredSkills = requirements.preferredSkills || [];
    const requiredExp = requirements.requiredExperience || "";
    const requiredEdu = requirements.requiredEducation || "";

    // Normalisation des compétences du CV
    let cvSkills = [];
    if (Array.isArray(cvData.skills)) {
      cvSkills = cvData.skills;
    } else if (cvData.skills && typeof cvData.skills === "object") {
      cvSkills = Object.values(cvData.skills).flat();
    }

    // Matching simple (insensible à la casse)
    const normalize = (s) => (s || "").toLowerCase().trim();
    const cvSkillsLower = cvSkills.map(normalize);

    const matchedSkills = requiredSkills.filter((s) =>
      cvSkillsLower.some(
        (cs) => cs.includes(normalize(s)) || normalize(s).includes(cs),
      ),
    );

    const missingSkills = requiredSkills.filter(
      (s) =>
        !cvSkillsLower.some(
          (cs) => cs.includes(normalize(s)) || normalize(s).includes(cs),
        ),
    );

    const matchedPreferred = preferredSkills.filter((s) =>
      cvSkillsLower.some(
        (cs) => cs.includes(normalize(s)) || normalize(s).includes(cs),
      ),
    );

    const missingPreferred = preferredSkills.filter(
      (s) =>
        !cvSkillsLower.some(
          (cs) => cs.includes(normalize(s)) || normalize(s).includes(cs),
        ),
    );

    // Analyse des expériences
    const cvExperiences = cvData.experiences || [];
    const totalExperienceYears = cvExperiences.reduce((acc, exp) => {
      const start = exp.startDate
        ? parseInt(exp.startDate.match(/\d{4}/)?.[0] || "0")
        : 0;
      const end = exp.endDate
        ? parseInt(exp.endDate.match(/\d{4}/)?.[0] || "0")
        : new Date().getFullYear();
      return acc + (end - start);
    }, 0);

    // Analyse de la formation
    const cvEducation = cvData.education || [];
    const hasEducation = cvEducation.length > 0;

    return {
      skills: {
        matched: matchedSkills,
        missing: missingSkills,
        matchedPreferred,
        missingPreferred,
      },
      experience: {
        totalYears: totalExperienceYears,
        required: requiredExp,
        sufficient: requiredExp
          ? totalExperienceYears >=
            parseInt(requiredExp.match(/\d+/)?.[0] || "0")
          : true,
      },
      education: {
        has: hasEducation,
        required: requiredEdu,
        sufficient: requiredEdu ? hasEducation : true,
      },
      recommendations: [
        ...missingSkills.map((s) => ({
          type: "skill",
          priority: "high",
          message: `Ajoutez la compétence "${s}" dans votre CV si vous la maîtrisez.`,
          suggestion: `Ex: "Maîtrise de ${s} acquise lors de..."`,
        })),
        ...missingPreferred.map((s) => ({
          type: "skill",
          priority: "medium",
          message: `"${s}" est un plus pour ce poste. Mentionnez-la si possible.`,
          suggestion: `Ex: "Notions de ${s}"`,
        })),
      ],
    };
  },
  async createManual(userId, cvId, jobOfferId) {
    const cv = await CV.findOne({ where: { id: cvId, userId } });
    if (!cv) throw Object.assign(new Error("CV introuvable"), { status: 404 });

    const lastVersion = await CVVersion.findOne({
      where: { cvId, jobOfferId },
      order: [["versionNumber", "DESC"]],
    });
    const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

    const parsed = cv.parsedData || {};

    const normalizeSkills = (rawSkills) => {
      const emptyCategories = {
        langages: [],
        frameworks: [],
        outils: [],
        methodologies: [],
      };

      if (!rawSkills) return emptyCategories;

      if (typeof rawSkills === "object" && !Array.isArray(rawSkills)) {
        return {
          langages: Array.isArray(rawSkills.langages) ? rawSkills.langages : [],
          frameworks: Array.isArray(rawSkills.frameworks)
            ? rawSkills.frameworks
            : [],
          outils: Array.isArray(rawSkills.outils) ? rawSkills.outils : [],
          methodologies: Array.isArray(rawSkills.methodologies)
            ? rawSkills.methodologies
            : [],
        };
      }

      if (Array.isArray(rawSkills)) {
        const categorized = { ...emptyCategories };
        rawSkills.forEach((s) => {
          const lower = s.toLowerCase();
          if (
            /^(javascript|python|java|php|sql|html|css|typescript|c\+\+|c#|ruby|go|rust|swift|kotlin)/i.test(
              lower,
            )
          ) {
            categorized.langages.push(s);
          } else if (
            /^(react|vue|angular|express|laravel|django|flask|spring|next|nuxt|svelte|tailwind|bootstrap|redux|zustand)/i.test(
              lower,
            )
          ) {
            categorized.frameworks.push(s);
          } else if (
            /^(git|docker|kubernetes|postman|vs code|figma|jira|mongodb|postgres|mysql|aws|azure|gcp)/i.test(
              lower,
            )
          ) {
            categorized.outils.push(s);
          } else {
            categorized.methodologies.push(s);
          }
        });
        return categorized;
      }

      return emptyCategories;
    };

    const content = {
      header: {
        name: (parsed.name || "").replace(/^#+\s*/, ""),
        email: parsed.email || "",
        phone: parsed.phone || "",
        github: parsed.github || "",
        linkedin: parsed.linkedin || "",
        portfolio: parsed.portfolio || "",
        summary: parsed.summary || "",
      },
      skills: normalizeSkills(parsed.skills),
      experiences: Array.isArray(parsed.experiences)
        ? parsed.experiences.map((e) => ({
            title_and_company:
              [e.title, e.company].filter(Boolean).join(" : ") || "",
            dates: [e.startDate, e.endDate].filter(Boolean).join(" – ") || "",
            context: "",
            missions: e.description ? [e.description] : [],
            result: "",
          }))
        : [],
      education: Array.isArray(parsed.education)
        ? parsed.education.map((e) => ({
            title: [e.degree, e.institution].filter(Boolean).join(" – ") || "",
            dates:
              e.startDate && e.endDate
                ? `${e.startDate} – ${e.endDate}`
                : e.year || "",
            details: [],
          }))
        : [],
      languages: Array.isArray(parsed.languages)
        ? parsed.languages.map((l) =>
            typeof l === "string"
              ? { language: l, level: null }
              : { language: l.language || "", level: l.level || null },
          )
        : [],
      certifications: Array.isArray(parsed.certifications)
        ? parsed.certifications
        : [],
      projects: Array.isArray(parsed.projects)
        ? parsed.projects.map((p) => ({
            name: p.name || "",
            dates: "",
            missions: p.description ? [p.description] : [],
            result: "",
          }))
        : [],
    };

    return CVVersion.create({
      cvId,
      jobOfferId,
      versionNumber,
      content,
      changeSummary: {
        reorganized: ["Création manuelle"],
        reformulated: [],
        highlighted: [],
        flaggedClaims: [],
        antiInventionIssues: [],
      },
      validated: false,
    });
  },
};
