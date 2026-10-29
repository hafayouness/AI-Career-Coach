import { useState } from "react";
import { Sparkles, Copy, Trash2, Save, FileText } from "lucide-react";
import {
  usePresentations,
  useGeneratePresentation,
  useDeletePresentation,
  useUpdatePresentation,
} from "../hooks/usePresentations";
import { useCVs } from "../hooks/useCVs";
import { useJobOffers } from "../hooks/useJobOffers";
import { Spinner, Button, Alert, ConfirmDialog } from "../components/ui";
import { PresentationLoader } from "../components/presentations/PresentationLoader";

const TYPE_LABELS: Record<string, string> = {
  "30s": "speech 30 secondes",
  "1min": "speech 1 minute",
  "2min": "speech 2 minutes",
  tell_me_about_yourself: "Parlez-moi de vous",
  why_this_job: "Pourquoi ce poste ?",
  why_hire_you: "Pourquoi vous recruter ?",
  strengths_weaknesses: "Forces et axes d'amélioration",
};

export const PresentationsPage = () => {
  const { data: presentations, isLoading } = usePresentations();
  const { data: cvs } = useCVs();
  const { data: offers } = useJobOffers();
  const generate = useGeneratePresentation();
  const del = useDeletePresentation();
  const update = useUpdatePresentation();

  const [cvId, setCvId] = useState("");
  const [offerId, setOfferId] = useState("");
  const [language, setLanguage] = useState("fr");
  const [type, setType] = useState("30s");
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  const readyCVs = cvs?.filter((c) => c.processingStatus === "completed") || [];
  const readyOffers =
    offers?.filter((o) => o.parsingStatus === "completed") || [];

  const handleGenerate = () => {
    if (!cvId || !offerId) {
      setError("Sélectionnez un CV et une offre.");
      return;
    }
    setError("");
    generate.mutate(
      { cvId: Number(cvId), jobOfferId: Number(offerId), language, type },
      { onError: (e: any) => setError(e?.response?.data?.message || "Erreur") },
    );
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <>
      <div className="cvversions-page__header">
        <div>
          <h1 className="cvversions-page__title">Présentations</h1>
          <p className="cvversions-page__subtitle">
            Générez votre speech d'entretien.
          </p>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="card" style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div className="field">
            <label>CV</label>
            <select
              className="input"
              value={cvId}
              onChange={(e) => setCvId(e.target.value)}
            >
              <option value="">— CV —</option>
              {readyCVs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.parsedData?.name || c.originalFileName}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Offre</label>
            <select
              className="input"
              value={offerId}
              onChange={(e) => setOfferId(e.target.value)}
            >
              <option value="">— Offre —</option>
              {readyOffers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Langue</label>
            <select
              className="input"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="fr">Français</option>
              <option value="en">Anglais</option>
              <option value="ar">Arabe</option>
            </select>
          </div>
          <div className="field">
            <label>Type</label>
            <select
              className="input"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingBottom: 8,
          }}
        >
          <Button
            variant="ai"
            onClick={handleGenerate}
            style={{ padding: "12px 40px", fontSize: 16, borderRadius: 999 }}
          >
            <Sparkles size={18} style={{ marginRight: 8 }} />
            Générer la présentation
          </Button>
        </div>
      </div>

      {generate.isPending && <PresentationLoader />}

      {isLoading && <Spinner dark />}

      {/* Liste */}
      {/* Liste */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {presentations?.map((p) => {
          // Estimer le temps de lecture (200 mots / minute)
          const wordCount = p.content.split(/\s+/).length;
          const readingTime = Math.max(1, Math.round(wordCount / 200));

          return (
            <div
              key={p.id}
              className="card"
              style={{ borderLeft: "4px solid var(--ai)" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}
              >
                <div>
                  <h3
                    style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}
                  >
                    {TYPE_LABELS[p.type] || p.type}
                  </h3>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {p.jobOffer?.title} · {p.jobOffer?.company} ·{" "}
                    {p.language.toUpperCase()}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-light)",
                      marginTop: 4,
                    }}
                  >
                    ⏱️ ~{readingTime} min de lecture · {wordCount} mots
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <Button variant="ghost" onClick={() => handleCopy(p.content)}>
                    <Copy size={14} /> Copier
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditingId(p.id);
                      setEditContent(p.content);
                    }}
                  >
                    <FileText size={14} /> Modifier
                  </Button>
                  <Button variant="danger" onClick={() => setToDelete(p.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              {/* Contenu ou édition */}
              {editingId === p.id ? (
                <>
                  <textarea
                    className="input"
                    style={{
                      width: "100%",
                      minHeight: 200,
                      fontFamily: "inherit",
                      lineHeight: 1.6,
                      fontSize: 15,
                    }}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <Button
                      variant="primary"
                      onClick={() => {
                        update.mutate(
                          { id: p.id, content: editContent },
                          { onSuccess: () => setEditingId(null) },
                        );
                      }}
                    >
                      <Save size={14} /> Enregistrer
                    </Button>
                    <Button variant="ghost" onClick={() => setEditingId(null)}>
                      Annuler
                    </Button>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    background: "var(--surface-2)",
                    padding: 16,
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                  }}
                >
                  <p
                    style={{
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.8,
                      margin: 0,
                      fontSize: 15,
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    "{p.content}"
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Supprimer cette présentation ?"
        message="Cette action est irréversible."
        onConfirm={() => {
          if (toDelete)
            del.mutate(toDelete, { onSuccess: () => setToDelete(null) });
        }}
        onClose={() => setToDelete(null)}
      />
    </>
  );
};
