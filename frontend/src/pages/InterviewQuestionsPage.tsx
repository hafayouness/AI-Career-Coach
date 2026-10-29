import { useState } from "react";
import { Sparkles, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  useInterviewQuestions,
  useGenerateQuestions,
  useDeleteQuestion,
} from "../hooks/useInterviewQuestions";
import { useCVs } from "../hooks/useCVs";
import { useJobOffers } from "../hooks/useJobOffers";
import { Spinner, Button, Alert, ConfirmDialog } from "../components/ui";
import { InterviewQuestionsLoader } from "../components/interview/InterviewQuestionsLoader";

const CATEGORY_COLORS: Record<string, string> = {
  RH: "#dbeafe",
  Technique: "#f3e8ff",
  Comportemental: "#fef3c7",
  Projet: "#dcfce7",
};

export const InterviewQuestionsPage = () => {
  const { data: questions, isLoading } = useInterviewQuestions();
  const { data: cvs } = useCVs();
  const { data: offers } = useJobOffers();
  const generate = useGenerateQuestions();
  const del = useDeleteQuestion();

  const [cvId, setCvId] = useState("");
  const [offerId, setOfferId] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<number | null>(null);
  const [error, setError] = useState("");

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
      {
        cvId: Number(cvId),
        jobOfferId: Number(offerId),
        categories: ["RH", "Technique", "Comportemental", "Projet"],
      },
      { onError: () => setError("Erreur lors de la génération.") },
    );
  };

  return (
    <>
      <div className="cvversions-page__header">
        <div>
          <h1 className="cvversions-page__title">Préparation aux questions</h1>
          <p className="cvversions-page__subtitle">
            Générez les questions que le recruteur va vous poser.
          </p>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="card" style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div className="field">
            <label>CV</label>
            <select
              className="input"
              value={cvId}
              onChange={(e) => setCvId(e.target.value)}
            >
              <option value="">— Sélectionner un CV —</option>
              {readyCVs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.parsedData?.name || c.originalFileName}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Offre cible</label>
            <select
              className="input"
              value={offerId}
              onChange={(e) => setOfferId(e.target.value)}
            >
              <option value="">— Sélectionner une offre —</option>
              {readyOffers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title} ({o.company})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="ai"
            onClick={handleGenerate}
            loading={generate.isPending}
            style={{ padding: "12px 40px", borderRadius: 999 }}
          >
            <Sparkles size={16} style={{ marginRight: 8 }} /> Générer les
            questions
          </Button>
        </div>
      </div>

      {generate.isPending && <InterviewQuestionsLoader />}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {isLoading && <Spinner dark />}
        {questions?.map((q) => (
          <div
            key={q.id}
            className="card"
            style={{ padding: 0, overflow: "hidden" }}
          >
            <div
              onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
              style={{
                padding: 16,
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--surface)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  className="badge"
                  style={{
                    background: CATEGORY_COLORS[q.category],
                    color: "#000",
                  }}
                >
                  {q.category}
                </span>
                <span style={{ fontWeight: 600 }}>{q.questionText}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setToDelete(q.id);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-light)",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={16} />
                </button>
                {expandedId === q.id ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </div>
            </div>

            {expandedId === q.id && (
              <div
                style={{
                  padding: 16,
                  background: "var(--surface-2)",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <strong>🎯 Objectif du recruteur :</strong>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      color: "var(--text-muted)",
                    }}
                  >
                    {q.objective}
                  </p>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>🧠 Méthode de réponse :</strong>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      color: "var(--text-muted)",
                    }}
                  >
                    {q.method}
                  </p>
                </div>
                <div
                  style={{
                    marginBottom: 12,
                    padding: 12,
                    background: "var(--surface)",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                  }}
                >
                  <strong style={{ color: "var(--accent-hover)" }}>
                    ✅ Exemple de réponse :
                  </strong>
                  <p
                    style={{
                      margin: "8px 0 0",
                      fontSize: 14,
                      fontStyle: "italic",
                      lineHeight: 1.6,
                    }}
                  >
                    "{q.exampleAnswer}"
                  </p>
                </div>
                <div>
                  <strong style={{ color: "var(--danger)" }}>
                    ⚠️ Erreurs à éviter :
                  </strong>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      color: "var(--text-muted)",
                    }}
                  >
                    {q.mistakesToAvoid}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Supprimer cette question ?"
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
