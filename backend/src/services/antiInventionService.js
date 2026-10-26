export const antiInventionService = {
  check(generated, original) {
    const issues = [];

    const originalSkills = (original.skills || []).map((s) => s.toLowerCase());
    for (const s of generated.skills || []) {
      if (!this.fuzzyMatch(s, originalSkills)) {
        issues.push({
          type: "skill",
          value: s,
          reason: "Compétence absente du CV original",
        });
      }
    }

    const originalExpTitles = (original.experiences || []).map((e) =>
      (e.title || "").toLowerCase(),
    );
    for (const e of generated.experiences || []) {
      if (!this.fuzzyMatch(e.title, originalExpTitles)) {
        issues.push({
          type: "experience",
          value: e.title,
          reason: "Expérience non trouvée dans le CV original",
        });
      }
    }

    const originalDegrees = (original.education || []).map((e) =>
      (e.degree || "").toLowerCase(),
    );
    for (const e of generated.education || []) {
      if (!this.fuzzyMatch(e.degree, originalDegrees)) {
        issues.push({
          type: "education",
          value: e.degree,
          reason: "Diplôme absent du CV original",
        });
      }
    }

    const originalLangs = (original.languages || []).map((l) =>
      (l.language || "").toLowerCase(),
    );
    for (const l of generated.languages || []) {
      if (!this.fuzzyMatch(l.language, originalLangs)) {
        issues.push({
          type: "language",
          value: l.language,
          reason: "Langue absente du CV original",
        });
      }
    }

    const originalCerts = (original.certifications || []).map((c) =>
      c.toLowerCase(),
    );
    for (const c of generated.certifications || []) {
      if (!this.fuzzyMatch(c, originalCerts)) {
        issues.push({
          type: "certification",
          value: c,
          reason: "Certification absente du CV original",
        });
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  },

  fuzzyMatch(value, list) {
    if (!value) return false;
    const v = value.toLowerCase().trim();
    return list.some((item) => {
      const i = item.toLowerCase().trim();
      if (!i) return false;
      return i === v || i.includes(v) || v.includes(i);
    });
  },
};
