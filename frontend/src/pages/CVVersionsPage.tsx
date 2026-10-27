import { useState } from "react";
import { Sparkles, FileText } from "lucide-react";
import {
  useCVVersions,
  useDeleteCVVersion,
  useGenerateCVVersion,
} from "../hooks/useCVVersions";
import { CVVersionGenerator } from "../components/cvversions/CVVersionGenerator";
import { CVVersionLoader } from "../components/cvversions/CVVersionLoader";
import { CVVersionCard } from "../components/cvversions/CVVersionCard";
import { CVVersionEditor } from "../components/cvversions/CVVersionEditor";
import { Spinner, Alert, Button, ConfirmDialog } from "../components/ui";
import { extractError } from "../services/api";

export const CVVersionsPage = () => {
  const { data: versions, isLoading, isError } = useCVVersions();
  const deleteVersion = useDeleteCVVersion();
  const generate = useGenerateCVVersion();

  const [showGenerator, setShowGenerator] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState<number | null>(null);

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

  const confirmDelete = () => {
    if (toDelete === null) return;
    deleteVersion.mutate(toDelete, {
      onSuccess: () => setToDelete(null),
    });
  };

  return (
    <>
      <div className="cvversions-page__header">
        <div>
          <h1 className="cvversions-page__title">CV adaptés</h1>
          <p className="cvversions-page__subtitle">
            Générez une version optimisée de votre CV pour une offre précise,
            sans jamais inventer d'informations.
          </p>
        </div>
        <Button variant="ai" onClick={() => setShowGenerator(true)}>
          <Sparkles size={16} /> Générer un CV
        </Button>
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
            Générez une version personnalisée pour une offre spécifique.
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
        cancelLabel="Annuler"
        variant="danger"
        loading={deleteVersion.isPending}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  );
};
