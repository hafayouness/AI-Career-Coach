import { useState } from "react";
import { Sparkles, FileText, Plus } from "lucide-react";
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
            style={{ height: "auto" }}
          >
            <div className="offer-form__header">
              <h2 className="offer-form__title">Créer un CV manuellement</h2>
              <button
                className="offer-form__close"
                onClick={() => setShowManualModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="field">
              <label>CV source</label>
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

            <div className="field">
              <label>Offre cible</label>
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

            <div className="offer-form__actions">
              <Button variant="ghost" onClick={() => setShowManualModal(false)}>
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateManual}
                loading={createManual.isPending}
                disabled={!manualCvId || !manualOfferId}
              >
                Créer le CV
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
