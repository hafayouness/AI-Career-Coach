import { useState } from "react";
import {
  Sparkles,
  FileText,
  Plus,
  Briefcase,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  useCVVersions,
  useDeleteCVVersion,
  useGenerateCVVersion,
  useCreateManualCVVersion,
} from "../hooks/useCVVersions";
import { useCVs } from "../hooks/useCVs";
import { useJobOffers } from "../hooks/useJobOffers";
import { CVVersionGenerator } from "../components/cvversions/CVVersionGenerator";
import { CVVersionLoader } from "../components/cvversions/CVVersionLoader";
import { CVVersionCard } from "../components/cvversions/CVVersionCard";
import { CVVersionEditor } from "../components/cvversions/CVVersionEditor";
import { Spinner, Alert, Button, ConfirmDialog } from "../components/ui";
import { extractError } from "../services/api";

export const CVVersionsPage = () => {
  const { data: versions, isLoading, isError } = useCVVersions();
  const { data: cvs } = useCVs();
  const { data: offers } = useJobOffers();
  const deleteVersion = useDeleteCVVersion();
  const generate = useGenerateCVVersion();
  const createManual = useCreateManualCVVersion();

  const [showGenerator, setShowGenerator] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [manualCvId, setManualCvId] = useState("");
  const [manualOfferId, setManualOfferId] = useState("");

  const readyCVs = cvs?.filter((c) => c.processingStatus === "completed") ?? [];
  const readyOffers =
    offers?.filter((o) => o.parsingStatus === "completed") ?? [];
  const selectedCV = readyCVs.find((c) => c.id === Number(manualCvId));
  const selectedOffer = readyOffers.find((o) => o.id === Number(manualOfferId));

  const handleGenerate = (cvId: number, jobOfferId: number) => {
    setShowGenerator(false);
    setError("");
    generate.mutate(
      { cvId, jobOfferId },
      {
        onSuccess: (v) => setOpenId(v.id),
        onError: (err) => setError(extractError(err)),
      },
    );
  };

  const handleCreateManual = () => {
    if (!manualCvId || !manualOfferId) return;
    setError("");
    createManual.mutate(
      { cvId: Number(manualCvId), jobOfferId: Number(manualOfferId) },
      {
        onSuccess: (v) => {
          setShowManualModal(false);
          setManualCvId("");
          setManualOfferId("");
          setOpenId(v.id);
        },
        onError: (err) => setError(extractError(err)),
      },
    );
  };

  const handleDelete = (id: number) => {
    deleteVersion.mutate(id, { onSuccess: () => setToDelete(null) });
  };

  return (
    <>
      <div className="cvversions-page__header">
        <div>
          <h1 className="cvversions-page__title">CV adaptés</h1>
          <p className="cvversions-page__subtitle">
            Générez ou créez manuellement une version optimisée pour une offre.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Button variant="ghost" onClick={() => setShowManualModal(true)}>
            <Plus size={16} /> Créer manuellement
          </Button>
          <Button variant="ai" onClick={() => setShowGenerator(true)}>
            <Sparkles size={16} /> Générer par IA
          </Button>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {isLoading && (
        <div style={{ display: "grid", placeItems: "center", padding: 60 }}>
          <Spinner dark />
        </div>
      )}

      {isError && (
        <Alert variant="error">Impossible de charger les versions.</Alert>
      )}

      {versions && versions.length === 0 && !generate.isPending && (
        <div className="cvversions-empty">
          <div className="cvversions-empty__icon">
            <FileText size={28} />
          </div>
          <div className="cvversions-empty__title">
            Aucun CV adapté pour le moment
          </div>
          <div className="cvversions-empty__text">
            Générez une version personnalisée pour une offre, ou créez-la
            manuellement.
          </div>
          <Button variant="ai" onClick={() => setShowGenerator(true)}>
            <Sparkles size={16} /> Générer mon premier CV
          </Button>
        </div>
      )}

      {versions && versions.length > 0 && (
        <div className="cvversions-grid">
          {versions.map((v) => (
            <CVVersionCard
              key={v.id}
              version={v}
              onClick={() => setOpenId(v.id)}
              onDelete={(e) => {
                e.stopPropagation();
                setToDelete(v.id);
              }}
            />
          ))}
        </div>
      )}

      {showGenerator && (
        <CVVersionGenerator
          onClose={() => setShowGenerator(false)}
          onSuccess={handleGenerate}
        />
      )}

      {showManualModal && (
        <div
          className="offer-form-overlay"
          onClick={() => setShowManualModal(false)}
        >
          <div
            className="offer-form"
            onClick={(e) => e.stopPropagation()}
            style={{ height: "auto", maxHeight: "90vh", maxWidth: 820 }}
          >
            <div className="offer-form__header">
              <div>
                <h2 className="offer-form__title">Créer un CV adapté</h2>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    margin: "4px 0 0 0",
                  }}
                >
                  Sélectionnez un CV et une offre pour créer une base éditable.
                </p>
              </div>
              <button
                className="offer-form__close"
                onClick={() => setShowManualModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            {error && <Alert variant="error">{error}</Alert>}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginTop: 8,
              }}
            >
              <div>
                <div className="field" style={{ marginBottom: 12 }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                    }}
                  >
                    <FileText size={14} /> CV source
                  </label>
                  <select
                    className="input"
                    value={manualCvId}
                    onChange={(e) => setManualCvId(e.target.value)}
                  >
                    <option value="">— Sélectionner un CV —</option>
                    {readyCVs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.parsedData?.name || c.originalFileName}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCV && (
                  <div
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 12,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        marginBottom: 8,
                        color: "var(--text)",
                      }}
                    >
                      {selectedCV.parsedData?.name || "CV sans nom"}
                    </div>

                    {selectedCV.parsedData?.summary && (
                      <div
                        style={{
                          color: "var(--text-muted)",
                          marginBottom: 8,
                          fontStyle: "italic",
                          lineHeight: 1.4,
                        }}
                      >
                        {selectedCV.parsedData.summary.slice(0, 120)}...
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 16 }}>
                      <div>
                        <span style={{ color: "var(--text-light)" }}>
                          Expériences :
                        </span>{" "}
                        <strong>
                          {selectedCV.parsedData?.experiences?.length || 0}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-light)" }}>
                          Formations :
                        </span>{" "}
                        <strong>
                          {selectedCV.parsedData?.education?.length || 0}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="field" style={{ marginBottom: 12 }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                    }}
                  >
                    <Briefcase size={14} /> Offre cible
                  </label>
                  <select
                    className="input"
                    value={manualOfferId}
                    onChange={(e) => setManualOfferId(e.target.value)}
                  >
                    <option value="">— Sélectionner une offre —</option>
                    {readyOffers.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.title}
                        {o.company ? ` — ${o.company}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedOffer && (
                  <div
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 12,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        marginBottom: 4,
                        color: "var(--text)",
                      }}
                    >
                      {selectedOffer.title}
                    </div>
                    <div
                      style={{
                        color: "var(--text-muted)",
                        marginBottom: 8,
                      }}
                    >
                      {selectedOffer.company || "—"}
                      {selectedOffer.location
                        ? ` · ${selectedOffer.location}`
                        : ""}
                    </div>

                    {selectedOffer.requirements?.requiredSkills &&
                      selectedOffer.requirements.requiredSkills.length > 0 && (
                        <>
                          <div
                            style={{
                              color: "var(--text-light)",
                              marginBottom: 4,
                              fontSize: 11,
                            }}
                          >
                            Compétences requises :
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 4,
                            }}
                          >
                            {selectedOffer.requirements.requiredSkills
                              .slice(0, 6)
                              .map((s) => (
                                <span
                                  key={s}
                                  style={{
                                    fontSize: 10,
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                    background: "var(--primary-soft)",
                                    color: "var(--primary)",
                                  }}
                                >
                                  {s}
                                </span>
                              ))}
                            {selectedOffer.requirements.requiredSkills.length >
                              6 && (
                              <span
                                style={{
                                  fontSize: 10,
                                  color: "var(--text-muted)",
                                  padding: "2px 6px",
                                }}
                              >
                                +
                                {selectedOffer.requirements.requiredSkills
                                  .length - 6}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                  </div>
                )}
              </div>
            </div>

            {selectedCV && selectedOffer && (
              <div
                style={{
                  marginTop: 16,
                  padding: 12,
                  background: "var(--success-soft)",
                  border: "1px solid #bbf7d0",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "#166534",
                }}
              >
                <CheckCircle2 size={16} />
                <span>
                  CV adapté pour <strong>{selectedOffer.title}</strong> prêt à
                  être créé.
                </span>
              </div>
            )}

            <div className="offer-form__actions" style={{ marginTop: 16 }}>
              <Button variant="ghost" onClick={() => setShowManualModal(false)}>
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateManual}
                loading={createManual.isPending}
                disabled={!manualCvId || !manualOfferId}
              >
                Créer votre CV adapté
              </Button>
            </div>
          </div>
        </div>
      )}

      {generate.isPending && (
        <div className="cvversion-loader-overlay">
          <CVVersionLoader />
        </div>
      )}

      {openId !== null && (
        <CVVersionEditor versionId={openId} onClose={() => setOpenId(null)} />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Supprimer ce CV adapté ?"
        message="Cette version sera définitivement supprimée. Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="danger"
        loading={deleteVersion.isPending}
        onConfirm={() => {
          if (toDelete) handleDelete(toDelete);
        }}
        onClose={() => setToDelete(null)}
      />
    </>
  );
};
