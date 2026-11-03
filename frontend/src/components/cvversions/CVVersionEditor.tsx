import { useEffect, useState } from "react";
import {
  X,
  Save,
  ShieldCheck,
  Download,
  Plus,
  Trash2,
  Edit3,
  Sparkles,
} from "lucide-react";
import { Button, Spinner, Alert } from "../ui";
import {
  useCVVersion,
  useUpdateCVVersion,
  useValidateCVVersion,
  downloadCVVersionPDF,
  useCVGaps,
} from "../../hooks/useCVVersions";
import { extractError } from "../../services/api";
import { CVVersionGaps } from "./CVVersionGaps";
import { useToastStore } from "../../store/toastStore";

interface Props {
  versionId: number;
  onClose: () => void;
}

export const CVVersionEditor = ({ versionId, onClose }: Props) => {
  const { data: version, isLoading, isError } = useCVVersion(versionId);
  const { data: gaps } = useCVGaps(versionId);
  const update = useUpdateCVVersion();
  const validate = useValidateCVVersion();
  const addToast = useToastStore((s) => s.addToast);

  const [draft, setDraft] = useState<any>(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newLangName, setNewLangName] = useState("");
  const [newLangLevel, setNewLangLevel] = useState("");

  useEffect(() => {
    if (version && !draft) setDraft(version.content);
  }, [version, draft]);

  const isLocked = version?.validated ?? false;
  const dirty =
    draft &&
    version &&
    JSON.stringify(draft) !== JSON.stringify(version.content);

  const onSave = () => {
    if (!draft) return;
    update.mutate(
      { id: versionId, content: draft },
      { onError: (err) => setError(extractError(err)) },
    );
  };

  const onValidate = () => {
    if (!version) return;
    validate.mutate(versionId, {
      onError: (err) => setError(extractError(err)),
    });
  };

  const onDownload = async () => {
    if (!version || !draft) return;
    setDownloading(true);
    try {
      await downloadCVVersionPDF(
        version.id,
        `CV-${(draft.header?.name || "adapte").replace(/\s+/g, "-")}.pdf`,
      );
    } catch {
      addToast("error", "Erreur PDF");
    } finally {
      setDownloading(false);
    }
  };

  const setField = (path: string, val: any) => {
    if (!draft) return;
    const newDraft = JSON.parse(JSON.stringify(draft));
    const keys = path.split(".");
    let cur = newDraft;
    for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
    cur[keys[keys.length - 1]] = val;
    setDraft(newDraft);
  };

  const addExperience = () => {
    setField("experiences", [
      ...(draft.experiences || []),
      {
        title_and_company: "",
        dates: "",
        context: "",
        missions: [],
        result: "",
      },
    ]);
  };
  const removeExperience = (i: number) => {
    const n = [...draft.experiences];
    n.splice(i, 1);
    setField("experiences", n);
  };

  const addProject = () => {
    setField("projects", [
      ...(draft.projects || []),
      { name: "", dates: "", missions: [], result: "" },
    ]);
  };
  const removeProject = (i: number) => {
    const n = [...draft.projects];
    n.splice(i, 1);
    setField("projects", n);
  };

  const addEducation = () => {
    setField("education", [
      ...(draft.education || []),
      { title: "", dates: "", details: [] },
    ]);
  };
  const removeEducation = (i: number) => {
    const n = [...draft.education];
    n.splice(i, 1);
    setField("education", n);
  };

  if (isLoading || !draft) {
    return (
      <div className="cvversion-editor-overlay">
        <div className="cvversion-editor">
          <div style={{ display: "grid", placeItems: "center", padding: 60 }}>
            <Spinner dark />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="cvversion-editor-overlay" onClick={onClose}>
        <div className="cvversion-editor" onClick={(e) => e.stopPropagation()}>
          <Alert variant="error">Erreur de chargement.</Alert>
          <Button variant="ghost" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="cvversion-editor-overlay" onClick={onClose}>
      <aside className="cvversion-editor" onClick={(e) => e.stopPropagation()}>
        <div className="cvversion-editor__header">
          <div>
            <h2 className="cvversion-editor__title">
              {version?.jobOffer?.title || "CV adapté"}
            </h2>
            <div
              className="cvversion-editor__meta"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span>
                v{version?.versionNumber} · {version?.jobOffer?.company || "—"}
                {version?.validated && " · Validé"}
              </span>
              {version?.changeSummary?.reorganized?.includes(
                "Création manuelle",
              ) ? (
                <span
                  className="version-badge"
                  style={{
                    background: "var(--primary-soft)",
                    color: "var(--primary)",
                    borderColor: "#c7d2fe",
                    fontSize: 10,
                  }}
                >
                  <Edit3 size={10} /> Manuel
                </span>
              ) : (
                <span
                  className="version-badge"
                  style={{
                    background: "var(--ai-soft)",
                    color: "var(--ai)",
                    borderColor: "#d9f99d",
                    fontSize: 10,
                  }}
                >
                  <Sparkles size={10} /> IA
                </span>
              )}
            </div>
          </div>
          <button className="cvversion-editor__close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <div className="cvversion-editor__form">
          <section className="cvversion-editor__section">
            <div className="cvversion-editor__section-title">En-tête</div>
            <div className="cvversion-editor__field">
              <label>Nom</label>
              <input
                value={draft.header?.name || ""}
                onChange={(e) =>
                  setField("header.name", e.target.value.replace(/^#+\s*/, ""))
                }
                disabled={isLocked}
              />
            </div>
            <div className="cvversion-editor__row">
              <div className="cvversion-editor__field">
                <label>Email</label>
                <input
                  value={draft.header?.email || ""}
                  onChange={(e) => setField("header.email", e.target.value)}
                  disabled={isLocked}
                />
              </div>
              <div className="cvversion-editor__field">
                <label>Téléphone</label>
                <input
                  value={draft.header?.phone || ""}
                  onChange={(e) => setField("header.phone", e.target.value)}
                  disabled={isLocked}
                />
              </div>
            </div>
            <div className="cvversion-editor__row">
              <div className="cvversion-editor__field">
                <label>GitHub</label>
                <input
                  value={draft.header?.github || ""}
                  onChange={(e) => setField("header.github", e.target.value)}
                  disabled={isLocked}
                />
              </div>
              <div className="cvversion-editor__field">
                <label>LinkedIn</label>
                <input
                  value={draft.header?.linkedin || ""}
                  onChange={(e) => setField("header.linkedin", e.target.value)}
                  disabled={isLocked}
                />
              </div>
            </div>
            <div className="cvversion-editor__field">
              <label>Portfolio</label>
              <input
                value={draft.header?.portfolio || ""}
                onChange={(e) => setField("header.portfolio", e.target.value)}
                disabled={isLocked}
              />
            </div>
            <div className="cvversion-editor__field">
              <label>Profil</label>
              <textarea
                value={draft.header?.summary || ""}
                onChange={(e) => setField("header.summary", e.target.value)}
                disabled={isLocked}
                rows={3}
              />
            </div>
          </section>

          {/* ==================== COMPÉTENCES ==================== */}
          <section className="cvversion-editor__section">
            <div className="cvversion-editor__section-title">Compétences</div>

            {(() => {
              // Détecte le format : objet catégorisé ou tableau simple
              const isCategorized =
                draft.skills &&
                typeof draft.skills === "object" &&
                !Array.isArray(draft.skills);

              if (isCategorized) {
                const categories = [
                  { key: "langages", label: "Langages" },
                  { key: "frameworks", label: "Frameworks & Libraries" },
                  { key: "outils", label: "Outils" },
                  { key: "methodologies", label: "Méthodologies" },
                ];

                return (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {categories.map(({ key, label }) => {
                      const items: string[] = draft.skills[key] || [];
                      return (
                        <div key={key}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              marginBottom: 8,
                              color: "var(--text)",
                            }}
                          >
                            {label}
                          </div>

                          {/* Chips existants */}
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 6,
                              marginBottom: 8,
                            }}
                          >
                            {items.length === 0 && (
                              <span
                                style={{
                                  fontSize: 12,
                                  color: "var(--text-muted)",
                                  fontStyle: "italic",
                                }}
                              >
                                Aucune compétence. Ajoutez-en ci-dessous.
                              </span>
                            )}
                            {items.map((s, i) => (
                              <span
                                key={`${key}-${s}-${i}`}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  background: "var(--primary-soft)",
                                  color: "var(--primary)",
                                  padding: "4px 10px",
                                  borderRadius: 999,
                                  fontSize: 12,
                                  border: "1px solid #c7d2fe",
                                }}
                              >
                                {s}
                                {!isLocked && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = items.filter(
                                        (_, idx) => idx !== i,
                                      );
                                      setField(`skills.${key}`, next);
                                    }}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      color: "var(--primary)",
                                      cursor: "pointer",
                                      padding: 0,
                                      fontSize: 13,
                                      lineHeight: 1,
                                    }}
                                    aria-label="Supprimer"
                                  >
                                    ×
                                  </button>
                                )}
                              </span>
                            ))}
                          </div>

                          {/* Zone d'ajout */}
                          {!isLocked && (
                            <div style={{ display: "flex", gap: 6 }}>
                              <input
                                type="text"
                                className="input"
                                placeholder={`Ajouter à ${label.toLowerCase()}...`}
                                style={{ flex: 1, fontSize: 12 }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    const input = e.currentTarget;
                                    const value = input.value.trim();
                                    if (value && !items.includes(value)) {
                                      setField(`skills.${key}`, [
                                        ...items,
                                        value,
                                      ]);
                                      input.value = "";
                                    }
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  const input = e.currentTarget
                                    .previousElementSibling as HTMLInputElement;
                                  const value = input.value.trim();
                                  if (value && !items.includes(value)) {
                                    setField(`skills.${key}`, [
                                      ...items,
                                      value,
                                    ]);
                                    input.value = "";
                                  }
                                }}
                                style={{
                                  background: "var(--primary)",
                                  color: "#fff",
                                  border: "none",
                                  padding: "0 12px",
                                  borderRadius: 6,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <Plus size={12} /> Ajouter
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              }

              // Fallback : format tableau simple
              const currentSkills: string[] = Array.isArray(draft.skills)
                ? draft.skills
                : [];
              return (
                <>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    {currentSkills.map((skill, i) => (
                      <span
                        key={`${skill}-${i}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          background: "var(--primary-soft)",
                          color: "var(--primary)",
                          padding: "6px 12px",
                          borderRadius: 999,
                          fontSize: 13,
                          border: "1px solid #c7d2fe",
                        }}
                      >
                        {skill}
                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...currentSkills];
                              next.splice(i, 1);
                              setField("skills", next);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--primary)",
                              cursor: "pointer",
                              padding: 0,
                              fontSize: 14,
                            }}
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  {!isLocked && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="text"
                        className="input"
                        placeholder="Ajouter une compétence"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const trimmed = newSkill.trim();
                            if (trimmed && !currentSkills.includes(trimmed)) {
                              setField("skills", [...currentSkills, trimmed]);
                              setNewSkill("");
                            }
                          }
                        }}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = newSkill.trim();
                          if (trimmed && !currentSkills.includes(trimmed)) {
                            setField("skills", [...currentSkills, trimmed]);
                            setNewSkill("");
                          }
                        }}
                        style={{
                          background: "var(--primary)",
                          color: "#fff",
                          border: "none",
                          padding: "0 16px",
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Plus size={14} /> Ajouter
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </section>

          <section className="cvversion-editor__section">
            <div
              className="cvversion-editor__section-title"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Expériences</span>
              {!isLocked && (
                <button
                  type="button"
                  onClick={addExperience}
                  style={{
                    background: "var(--primary-soft)",
                    border: "none",
                    color: "var(--primary)",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Plus size={12} /> Ajouter
                </button>
              )}
            </div>
            {(draft.experiences || []).map((exp: any, i: number) => (
              <div
                className="cvversion-editor__item"
                key={i}
                style={{ position: "relative" }}
              >
                {!isLocked && (
                  <button
                    type="button"
                    onClick={() => removeExperience(i)}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "none",
                      border: "none",
                      color: "var(--danger)",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <div className="cvversion-editor__field">
                  <label>Titre & Entreprise</label>
                  <input
                    value={exp.title_and_company || ""}
                    onChange={(e) => {
                      const n = [...draft.experiences];
                      n[i] = { ...n[i], title_and_company: e.target.value };
                      setField("experiences", n);
                    }}
                    disabled={isLocked}
                  />
                </div>
                <div className="cvversion-editor__field">
                  <label>Dates</label>
                  <input
                    value={exp.dates || ""}
                    onChange={(e) => {
                      const n = [...draft.experiences];
                      n[i] = { ...n[i], dates: e.target.value };
                      setField("experiences", n);
                    }}
                    disabled={isLocked}
                    placeholder="Ex: Nov 2024 – Avr 2025"
                  />
                </div>
                <div className="cvversion-editor__field">
                  <label>Contexte</label>
                  <textarea
                    value={exp.context || ""}
                    onChange={(e) => {
                      const n = [...draft.experiences];
                      n[i] = { ...n[i], context: e.target.value };
                      setField("experiences", n);
                    }}
                    disabled={isLocked}
                    rows={2}
                  />
                </div>
                <div className="cvversion-editor__field">
                  <label>Missions (une par ligne)</label>
                  <textarea
                    value={(exp.missions || []).join("\n")}
                    onChange={(e) => {
                      const n = [...draft.experiences];
                      const newMissions = e.target.value
                        .split("\n")
                        .map((line) => line.replace(/^[•●\-]\s*/, "").trim())
                        .filter(Boolean);
                      n[i] = { ...n[i], missions: newMissions };
                      setField("experiences", n);
                    }}
                    disabled={isLocked}
                    rows={4}
                    style={{ fontFamily: "monospace", fontSize: 12 }}
                  />
                </div>
                <div className="cvversion-editor__field">
                  <label>Résultat</label>
                  <textarea
                    value={exp.result || ""}
                    onChange={(e) => {
                      const n = [...draft.experiences];
                      n[i] = { ...n[i], result: e.target.value };
                      setField("experiences", n);
                    }}
                    disabled={isLocked}
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </section>

          {/* PROJETS */}
          <section className="cvversion-editor__section">
            <div
              className="cvversion-editor__section-title"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Projets</span>
              {!isLocked && (
                <button
                  type="button"
                  onClick={addProject}
                  style={{
                    background: "var(--primary-soft)",
                    border: "none",
                    color: "var(--primary)",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Plus size={12} /> Ajouter
                </button>
              )}
            </div>
            {(draft.projects || []).map((proj: any, i: number) => (
              <div
                className="cvversion-editor__item"
                key={i}
                style={{ position: "relative" }}
              >
                {!isLocked && (
                  <button
                    type="button"
                    onClick={() => removeProject(i)}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "none",
                      border: "none",
                      color: "var(--danger)",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <div className="cvversion-editor__field">
                  <label>Nom</label>
                  <input
                    value={proj.name || ""}
                    onChange={(e) => {
                      const n = [...draft.projects];
                      n[i] = { ...n[i], name: e.target.value };
                      setField("projects", n);
                    }}
                    disabled={isLocked}
                  />
                </div>
                <div className="cvversion-editor__field">
                  <label>Dates</label>
                  <input
                    value={proj.dates || ""}
                    onChange={(e) => {
                      const n = [...draft.projects];
                      n[i] = { ...n[i], dates: e.target.value };
                      setField("projects", n);
                    }}
                    disabled={isLocked}
                  />
                </div>
                <div className="cvversion-editor__field">
                  <label>Missions (une par ligne)</label>
                  <textarea
                    value={(proj.missions || []).join("\n")}
                    onChange={(e) => {
                      const n = [...draft.projects];
                      const newMissions = e.target.value
                        .split("\n")
                        .map((line) => line.replace(/^[•●\-]\s*/, "").trim())
                        .filter(Boolean);
                      n[i] = { ...n[i], missions: newMissions };
                      setField("projects", n);
                    }}
                    disabled={isLocked}
                    rows={3}
                    style={{ fontFamily: "monospace", fontSize: 12 }}
                  />
                </div>
                <div className="cvversion-editor__field">
                  <label>Résultat</label>
                  <textarea
                    value={proj.result || ""}
                    onChange={(e) => {
                      const n = [...draft.projects];
                      n[i] = { ...n[i], result: e.target.value };
                      setField("projects", n);
                    }}
                    disabled={isLocked}
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </section>

          {/* FORMATIONS */}
          <section className="cvversion-editor__section">
            <div
              className="cvversion-editor__section-title"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Formations</span>
              {!isLocked && (
                <button
                  type="button"
                  onClick={addEducation}
                  style={{
                    background: "var(--primary-soft)",
                    border: "none",
                    color: "var(--primary)",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Plus size={12} /> Ajouter
                </button>
              )}
            </div>
            {(draft.education || []).map((edu: any, i: number) => (
              <div
                className="cvversion-editor__item"
                key={i}
                style={{ position: "relative" }}
              >
                {!isLocked && (
                  <button
                    type="button"
                    onClick={() => removeEducation(i)}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "none",
                      border: "none",
                      color: "var(--danger)",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <div className="cvversion-editor__field">
                  <label>Titre</label>
                  <input
                    value={edu.title || ""}
                    onChange={(e) => {
                      const n = [...draft.education];
                      n[i] = { ...n[i], title: e.target.value };
                      setField("education", n);
                    }}
                    disabled={isLocked}
                  />
                </div>
                <div className="cvversion-editor__field">
                  <label>Dates</label>
                  <input
                    value={edu.dates || ""}
                    onChange={(e) => {
                      const n = [...draft.education];
                      n[i] = { ...n[i], dates: e.target.value };
                      setField("education", n);
                    }}
                    disabled={isLocked}
                    placeholder="Ex: Sept 2020 – Juil 2021"
                  />
                </div>
                <div className="cvversion-editor__field">
                  <label>Détails (une par ligne)</label>
                  <textarea
                    value={(edu.details || []).join("\n")}
                    onChange={(e) => {
                      const n = [...draft.education];
                      const newDetails = e.target.value
                        .split("\n")
                        .map((line) => line.replace(/^[•●\-]\s*/, "").trim())
                        .filter(Boolean);
                      n[i] = { ...n[i], details: newDetails };
                      setField("education", n);
                    }}
                    disabled={isLocked}
                    rows={2}
                    style={{ fontFamily: "monospace", fontSize: 12 }}
                  />
                </div>
              </div>
            ))}
          </section>

          <section className="cvversion-editor__section">
            <div className="cvversion-editor__section-title">Langues</div>
            {(() => {
              const currentLangs: { language: string; level: string | null }[] =
                Array.isArray(draft.languages)
                  ? draft.languages.map((l: any) =>
                      typeof l === "string"
                        ? { language: l, level: null }
                        : {
                            language: l?.language || "",
                            level: l?.level || null,
                          },
                    )
                  : typeof draft.languages === "string"
                    ? draft.languages.split(/[|,]/).map((s: string) => {
                        const [language, level] = s
                          .split(":")
                          .map((x: string) => x.trim());
                        return {
                          language: language || "",
                          level: level || null,
                        };
                      })
                    : [];

              return (
                <>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    {currentLangs.length === 0 && (
                      <span
                        style={{
                          fontSize: 13,
                          color: "var(--text-muted)",
                          fontStyle: "italic",
                        }}
                      >
                        Aucune langue. Ajoutez-en ci-dessous.
                      </span>
                    )}
                    {currentLangs.map((lang, i) => (
                      <span
                        key={`${lang.language}-${i}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          background: "var(--accent-soft)",
                          color: "#365314",
                          padding: "6px 12px",
                          borderRadius: 999,
                          fontSize: 13,
                          fontWeight: 500,
                          border: "1px solid #d9f99d",
                        }}
                      >
                        <strong>{lang.language}</strong>
                        {lang.level && (
                          <span style={{ opacity: 0.75 }}>· {lang.level}</span>
                        )}
                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...currentLangs];
                              next.splice(i, 1);
                              setField("languages", next);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#365314",
                              cursor: "pointer",
                              padding: 0,
                              fontSize: 14,
                              lineHeight: 1,
                            }}
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  {!isLocked && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <input
                        type="text"
                        className="input"
                        placeholder="Langue (ex: Français)"
                        value={newLangName}
                        onChange={(e) => setNewLangName(e.target.value)}
                        style={{ flex: "1 1 140px" }}
                      />
                      <select
                        className="input"
                        value={newLangLevel}
                        onChange={(e) => setNewLangLevel(e.target.value)}
                        style={{ flex: "1 1 120px" }}
                      >
                        <option value="">— Niveau —</option>
                        <option value="natif">Natif</option>
                        <option value="bilingue">Bilingue</option>
                        <option value="courant">Courant</option>
                        <option value="professionnel">Professionnel</option>
                        <option value="technique">Technique</option>
                        <option value="intermédiaire">Intermédiaire</option>
                        <option value="notions">Notions</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const name = newLangName.trim();
                          if (!name) return;
                          if (
                            currentLangs.some(
                              (l) =>
                                l.language.toLowerCase() === name.toLowerCase(),
                            )
                          )
                            return;
                          setField("languages", [
                            ...currentLangs,
                            { language: name, level: newLangLevel || null },
                          ]);
                          setNewLangName("");
                          setNewLangLevel("");
                        }}
                        style={{
                          background: "var(--primary)",
                          color: "#fff",
                          border: "none",
                          padding: "0 16px",
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          minHeight: 38,
                        }}
                      >
                        <Plus size={14} /> Ajouter
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </section>
        </div>

        <div className="cvversion-editor__actions">
          <Button variant="ghost" onClick={onDownload} loading={downloading}>
            <Download size={16} /> PDF
          </Button>
          {!isLocked && (
            <Button
              variant="ghost"
              onClick={onSave}
              disabled={!dirty}
              loading={update.isPending}
            >
              <Save size={16} /> Enregistrer
            </Button>
          )}
          {!isLocked && (
            <Button
              variant="ai"
              onClick={onValidate}
              loading={validate.isPending}
              disabled={dirty}
            >
              <ShieldCheck size={16} /> Valider
            </Button>
          )}
        </div>
      </aside>

      {gaps && (
        <aside
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 340,
            height: "100vh",
            overflowY: "auto",
            padding: 20,
            background: "var(--bg)",
            borderLeft: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 16,
              fontFamily: "var(--font-display)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            🎯 Pour ce poste
          </h2>
          <CVVersionGaps
            gaps={gaps}
            isLocked={isLocked}
            onAddSkill={(skill) => {
              // Détecte la catégorie selon le type de compétence
              const categorize = (s: string): string => {
                const lower = s.toLowerCase();
                if (
                  /^(javascript|python|java|php|sql|html|css|typescript|c\+\+|c#|ruby|go|rust|swift|kotlin)/i.test(
                    lower,
                  )
                )
                  return "langages";
                if (
                  /^(react|vue|angular|express|laravel|django|flask|spring|next|nuxt|svelte|tailwind|bootstrap|redux|zustand)/i.test(
                    lower,
                  )
                )
                  return "frameworks";
                if (
                  /^(git|docker|kubernetes|postman|vs code|figma|jira|mongodb|postgres|mysql|aws|azure|gcp)/i.test(
                    lower,
                  )
                )
                  return "outils";
                return "methodologies";
              };

              const category = categorize(skill);

              if (
                draft.skills &&
                typeof draft.skills === "object" &&
                !Array.isArray(draft.skills)
              ) {
                const current = draft.skills[category] || [];
                if (
                  current.some(
                    (c: string) => c.toLowerCase() === skill.toLowerCase(),
                  )
                ) {
                  addToast("info", `"${skill}" est déjà dans votre CV.`);
                  return;
                }
                setField(`skills.${category}`, [...current, skill]);
              } else {
                const current = Array.isArray(draft.skills) ? draft.skills : [];
                if (
                  current.some(
                    (c: string) => c.toLowerCase() === skill.toLowerCase(),
                  )
                ) {
                  addToast("info", `"${skill}" est déjà dans votre CV.`);
                  return;
                }
                setField("skills", [...current, skill]);
              }

              addToast("success", `"${skill}" ajouté à votre CV !`);
            }}
          />
        </aside>
      )}
    </div>
  );
};
