/**
 * Vérifie que le contenu généré ne contient AUCUNE affirmation
 * absente du CV original.
 *
 * Adapté à la nouvelle structure :
 *   skills: { langages: [], frameworks: [], outils: [], methodologies: [] }
 *   experiences: [{ title_and_company, dates, context, missions, result }]
 *   projects: [{ name, dates, missions, result }]
 *   education: [{ title, dates, details }]
 *   languages: string
 */
export const antiInventionService = {
  check(generated, original) {
    const issues = [];

    if (!original) return { valid: true, issues: [] };

    /* ---- SKILLS (objet avec sous-catégories) ---- */
    const originalSkills = [
      ...(original.skills?.langages || []),
      ...(original.skills?.frameworks || []),
      ...(original.skills?.outils || []),
      ...(original.skills?.methodologies || []),
      // ancien format (si jamais)
      ...(Array.isArray(original.skills) ? original.skills : []),
    ].map((s) => String(s).toLowerCase());

    const generatedSkills = [
      ...(generated.skills?.langages || []),
      ...(generated.skills?.frameworks || []),
      ...(generated.skills?.outils || []),
      ...(generated.skills?.methodologies || []),
    ];

    for (const s of generatedSkills) {
      if (!this.fuzzyMatch(s, originalSkills)) {
        issues.push({
          type: "skill",
          value: s,
          reason: "Compétence absente du CV original",
        });
      }
    }

    /* ---- EXPÉRIENCES ---- */
    const originalExps = (original.experiences || []).map((e) =>
      String(e.title || e.title_and_company || "").toLowerCase(),
    );

    for (const e of generated.experiences || []) {
      const title = e.title_and_company || e.title || "";
      if (title && !this.fuzzyMatch(title, originalExps)) {
        issues.push({
          type: "experience",
          value: title,
          reason: "Expérience non trouvée dans le CV original",
        });
      }
    }

    /* ---- PROJETS ---- */
    const originalProjects = (original.projects || []).map((p) =>
      String(p.name || "").toLowerCase(),
    );

    for (const p of generated.projects || []) {
      if (p.name && !this.fuzzyMatch(p.name, originalProjects)) {
        issues.push({
          type: "project",
          value: p.name,
          reason: "Projet non trouvé dans le CV original",
        });
      }
    }

    /* ---- FORMATIONS ---- */
    const originalEdu = (original.education || []).map((e) =>
      String(e.degree || e.title || "").toLowerCase(),
    );

    for (const e of generated.education || []) {
      const title = e.title || e.degree || "";
      if (title && !this.fuzzyMatch(title, originalEdu)) {
        issues.push({
          type: "education",
          value: title,
          reason: "Formation absente du CV original",
        });
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  },

  /**
   * Comparaison fuzzy simple : inclusion de mots.
   */
  fuzzyMatch(value, list) {
    if (!value) return false;
    const v = String(value).toLowerCase().trim();
    if (!v) return false;
    return list.some((item) => {
      const i = String(item).toLowerCase().trim();
      if (!i) return false;
      return i === v || i.includes(v) || v.includes(i);
    });
  },
};
