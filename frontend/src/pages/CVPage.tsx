import { useState } from "react";
import { FileText, Trash2, X, AlertTriangle, LoaderCircle } from "lucide-react";

import { useCVs, useDeleteCV } from "../hooks/useCVs";

import { CVUpload } from "../components/cv/CVUpload";
import { CVCard } from "../components/cv/CVCard";
import { CVDetail } from "../components/cv/CVDetail";
import { Spinner, Alert } from "../components/ui";

export const CVPage = () => {
  const { data: cvs, isLoading, isError } = useCVs();
  const deleteCV = useDeleteCV();

  const [openId, setOpenId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [extractionId, setExtractionId] = useState<number | null>(null);

  const handleDelete = () => {
    if (deleteId === null || deleteCV.isPending) return;

    deleteCV.mutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null);

        if (openId === deleteId) setOpenId(null);
        if (extractionId === deleteId) setExtractionId(null);
      },
    });
  };

  return (
    <div className="cv-page">
      <header className="cv-page__header">
        <div>
          <h1 className="cv-page__title">Mon CV</h1>
          <p className="cv-page__subtitle">
            Importez votre CV pour que l’IA l’analyse et l’utilise ensuite dans
            vos candidatures.
          </p>
        </div>
      </header>

      <CVUpload />

      {isLoading && (
        <div className="cv-page__loading">
          <Spinner dark />
        </div>
      )}

      {isError && <Alert variant="error">Impossible de charger vos CV.</Alert>}

      {cvs && cvs.length === 0 && (
        <div className="cv-empty">
          <div className="cv-empty__icon">
            <FileText size={28} />
          </div>

          <div className="cv-empty__title">Aucun CV pour le moment</div>

          <div className="cv-empty__text">
            Importez votre premier CV pour commencer.
          </div>
        </div>
      )}

      {cvs && cvs.length > 0 && (
        <div className="cv-grid">
          {cvs.map((cv) => (
            <div className="cv-item" key={cv.id}>
              <CVCard
                cv={cv}
                onClick={() => setOpenId(cv.id)}
                onDelete={(event) => {
                  event.stopPropagation();
                  setDeleteId(cv.id);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {deleteId !== null && (
        <div
          className="cv-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleteCV.isPending) {
              setDeleteId(null);
            }
          }}
        >
          <section
            className="cv-confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cv-delete-title"
            aria-describedby="cv-delete-description"
          >
            <button
              type="button"
              className="cv-modal-close"
              aria-label="Fermer"
              disabled={deleteCV.isPending}
              onClick={() => setDeleteId(null)}
            >
              <X size={20} />
            </button>

            <div className="cv-delete-icon">
              <AlertTriangle size={26} />
            </div>

            <h2 id="cv-delete-title">Supprimer ce CV ?</h2>

            <p id="cv-delete-description">
              Cette action est irréversible. Le fichier et les données associées
              à ce CV seront supprimés.
            </p>

            {deleteCV.isError && (
              <p className="cv-delete-error" role="alert">
                La suppression a échoué. Veuillez réessayer.
              </p>
            )}

            <div className="cv-modal-actions">
              <button
                type="button"
                className="cv-cancel-btn"
                disabled={deleteCV.isPending}
                onClick={() => setDeleteId(null)}
              >
                Annuler
              </button>

              <button
                type="button"
                className="cv-confirm-delete-btn"
                disabled={deleteCV.isPending}
                onClick={handleDelete}
              >
                {deleteCV.isPending ? (
                  <LoaderCircle size={17} className="cv-spin" />
                ) : (
                  <Trash2 size={17} />
                )}

                {deleteCV.isPending ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </section>
        </div>
      )}

      {openId !== null && (
        <CVDetail cvId={openId} onClose={() => setOpenId(null)} />
      )}
    </div>
  );
};
