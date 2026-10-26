import { useState } from "react";
import { Briefcase, Plus, Trash2, X, AlertTriangle } from "lucide-react";
import { useJobOffers, useDeleteJobOffer } from "../hooks/useJobOffers";
import { JobOfferForm } from "../components/offers/JobOfferForm";
import { JobOfferCard } from "../components/offers/JobOfferCard";
import { JobOfferDetail } from "../components/offers/JobOfferDetail";
import { Spinner, Alert, Button } from "../components/ui";

export const JobOffersPage = () => {
  const { data: offers, isLoading, isError } = useJobOffers();
  const deleteOffer = useDeleteJobOffer();

  const [showForm, setShowForm] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = () => {
    if (deleteId === null || deleteOffer.isPending) return;

    deleteOffer.mutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null);
      },
    });
  };

  const offerToDelete = offers?.find((offer) => offer.id === deleteId);

  return (
    <>
      <div className="offers-page__header">
        <div>
          <h1 className="offers-page__title">Offres d'emploi</h1>
          <p className="offers-page__subtitle">
            Enregistrez une offre pour analyser votre correspondance et adapter
            votre CV.
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Nouvelle offre
        </Button>
      </div>

      {isLoading && (
        <div className="offers-loading">
          <Spinner dark />
        </div>
      )}

      {isError && (
        <Alert variant="error">Impossible de charger les offres.</Alert>
      )}

      {offers && offers.length === 0 && (
        <div className="offers-empty">
          <div className="offers-empty__icon">
            <Briefcase size={28} />
          </div>
          <div className="offers-empty__title">Aucune offre pour le moment</div>
          <div className="offers-empty__text">
            Ajoutez votre première offre pour lancer une analyse de matching.
          </div>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Ajouter une offre
          </Button>
        </div>
      )}

      {offers && offers.length > 0 && (
        <div className="offers-grid">
          {offers.map((offer) => (
            <JobOfferCard
              key={offer.id}
              offer={offer}
              onClick={() => setOpenId(offer.id)}
              onDelete={(e) => {
                e.stopPropagation();
                setDeleteId(offer.id);
              }}
            />
          ))}
        </div>
      )}

      {showForm && <JobOfferForm onClose={() => setShowForm(false)} />}

      {openId !== null && (
        <JobOfferDetail offerId={openId} onClose={() => setOpenId(null)} />
      )}

      {deleteId !== null && (
        <div
          className="delete-modal-overlay"
          onClick={() => {
            if (!deleteOffer.isPending) setDeleteId(null);
          }}
        >
          <div
            className="delete-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="delete-modal__close"
              onClick={() => setDeleteId(null)}
              disabled={deleteOffer.isPending}
              aria-label="Fermer"
            >
              <X size={20} />
            </button>

            <div className="delete-modal__icon">
              <AlertTriangle size={28} />
            </div>

            <h2 id="delete-modal-title">Supprimer cette offre ?</h2>

            <p id="delete-modal-description">
              Voulez-vous vraiment supprimer
              {offerToDelete?.title
                ? ` « ${offerToDelete.title} »`
                : " cette offre d'emploi"}
              ? Cette action est irréversible.
            </p>

            {deleteOffer.isError && (
              <p className="delete-modal__error" role="alert">
                La suppression a échoué. Veuillez réessayer.
              </p>
            )}

            <div className="delete-modal__actions">
              <button
                type="button"
                className="delete-modal__cancel"
                onClick={() => setDeleteId(null)}
                disabled={deleteOffer.isPending}
              >
                Annuler
              </button>

              <button
                type="button"
                className="delete-modal__confirm"
                onClick={handleDelete}
                disabled={deleteOffer.isPending}
              >
                <Trash2 size={16} />
                {deleteOffer.isPending ? "Suppression..." : "Oui, supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
