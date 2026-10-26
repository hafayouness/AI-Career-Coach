import { Briefcase, Trash2, MapPin } from "lucide-react";
import type { JobOffer } from "../../types";

interface Props {
  offer: JobOffer;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const statusLabel: Record<JobOffer["parsingStatus"], string> = {
  pending: "En attente",
  processing: "Analyse en cours",
  completed: "Analysée",
  failed: "Échec",
};

export const JobOfferCard = ({ offer, onClick, onDelete }: Props) => {
  const skills =
    offer.requirements?.requiredSkills?.slice(0, 4) ??
    offer.requirements?.keywords?.slice(0, 4) ??
    [];

  return (
    <div className="offer-card" onClick={onClick}>
      <div className="offer-card__top">
        <div className="offer-card__icon">
          <Briefcase size={20} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="offer-card__title" title={offer.title}>
            {offer.title}
          </div>
          <div className="offer-card__meta">
            {offer.company || "—"}
            {offer.location && (
              <>
                {" · "}
                <MapPin
                  size={11}
                  style={{ display: "inline", verticalAlign: "middle" }}
                />{" "}
                {offer.location}
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`status-pill status-pill--${offer.parsingStatus}`}>
        {statusLabel[offer.parsingStatus]}
      </div>

      {skills.length > 0 && (
        <div className="offer-card__skills">
          {skills.map((s) => (
            <span key={s} className="skill-chip">
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="offer-card__footer">
        <span style={{ fontSize: 12, color: "var(--text-light)" }}>
          {new Date(offer.createdAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
        <button
          className="offer-card__delete"
          onClick={onDelete}
          aria-label="Supprimer"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
