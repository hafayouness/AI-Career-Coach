import { useEffect, useState } from "react";
import { X, Save, ShieldCheck, Download } from "lucide-react";
import { Button, Spinner, Alert } from "../ui";
import {
  useCVVersion,
  useUpdateCVVersion,
  useValidateCVVersion,
  downloadCVVersionPDF,
} from "../../hooks/useCVVersions";
import { extractError } from "../../services/api";

interface Props {
  versionId: number;
  onClose: () => void;
}

export const CVVersionEditor = ({ versionId, onClose }: Props) => {
  const { data: version, isLoading, isError } = useCVVersion(versionId);
  const update = useUpdateCVVersion();
  const validate = useValidateCVVersion();

  const [draft, setDraft] = useState<any>(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

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
      await downloadCVVersionPDF(version.id, `CV-${draft.header.name}.pdf`);
    } catch {
      setError("Erreur PDF");
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
          </div>
          <button className="cvversion-editor__close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <div className="cvversion-editor__form">
          {/* EN-TÊTE */}
          <section className="cvversion-editor__section">
            <div className="cvversion-editor__section-title">En-tête</div>
            <div className="cvversion-editor__field">
              <label>Nom</label>
              <input
                value={draft.header.name || ""}
                onChange={(e) => setField("header.name", e.target.value)}
                disabled={isLocked}
              />
            </div>
            <div className="cvversion-editor__row">
              <div className="cvversion-editor__field">
                <label>Email</label>
                <input
                  value={draft.header.email || ""}
                  onChange={(e) => setField("header.email", e.target.value)}
                  disabled={isLocked}
                />
              </div>
              <div className="cvversion-editor__field">
                <label>Téléphone</label>
                <input
                  value={draft.header.phone || ""}
                  onChange={(e) => setField("header.phone", e.target.value)}
                  disabled={isLocked}
                />
              </div>
            </div>
            <div className="cvversion-editor__field">
              <label>Profil (3 lignes max)</label>
              <textarea
                value={draft.header.summary || ""}
                onChange={(e) => setField("header.summary", e.target.value)}
                disabled={isLocked}
                rows={3}
              />
            </div>
          </section>

          {/* COMPÉTENCES */}
          <section className="cvversion-editor__section">
            <div className="cvversion-editor__section-title">Compétences</div>
            {["langages", "frameworks", "outils", "methodologies"].map(
              (cat) => (
                <div className="cvversion-editor__field" key={cat}>
                  <label style={{ textTransform: "capitalize" }}>{cat}</label>
                  <input
                    value={(draft.skills?.[cat] || []).join(", ")}
                    onChange={(e) =>
                      setField(
                        `skills.${cat}`,
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      )
                    }
                    disabled={isLocked}
                  />
                </div>
              ),
            )}
          </section>

          {/* EXPÉRIENCES */}
          <section className="cvversion-editor__section">
            <div className="cvversion-editor__section-title">Expériences</div>
            {(draft.experiences || []).map((exp: any, i: number) => (
              <div className="cvversion-editor__item" key={i}>
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
                  <label
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>Missions (une par ligne)</span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                      {(exp.missions || []).join("\n").length} car.
                    </span>
                  </label>
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
                    rows={5}
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
            <div className="cvversion-editor__section-title">Projets</div>
            {(draft.projects || []).map((proj: any, i: number) => (
              <div className="cvversion-editor__item" key={i}>
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
                    rows={4}
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
            <div className="cvversion-editor__section-title">Formations</div>
            {(draft.education || []).map((edu: any, i: number) => (
              <div className="cvversion-editor__item" key={i}>
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
                    rows={3}
                    style={{ fontFamily: "monospace", fontSize: 12 }}
                  />
                </div>
              </div>
            ))}
          </section>

          {/* LANGUES */}
          <section className="cvversion-editor__section">
            <div className="cvversion-editor__section-title">Langues</div>
            <div className="cvversion-editor__field">
              <label>Langues</label>
              <input
                value={draft.languages || ""}
                onChange={(e) => setField("languages", e.target.value)}
                disabled={isLocked}
              />
            </div>
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
    </div>
  );
};
