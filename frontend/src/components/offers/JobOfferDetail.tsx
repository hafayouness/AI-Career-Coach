import { X, ExternalLink } from "lucide-react";
import { useJobOffer } from "../../hooks/useJobOffers";
import { Spinner } from "../ui";

interface Props {
  offerId: number;
  onClose: () => void;
}

export const JobOfferDetail = ({ offerId, onClose }: Props) => {
  const { data: offer, isLoading, isError } = useJobOffer(offerId);

  return (
    <div className="offer-detail-overlay" onClick={onClose}>
      <aside className="offer-detail" onClick={(e) => e.stopPropagation()}>
        <div className="offer-detail__header">
          <div style={{ minWidth: 0 }}>
            <h2 className="offer-detail__title">{offer?.title || "Offre"}</h2>
            <div className="offer-detail__meta">
              {[offer?.company, offer?.location].filter(Boolean).join(" · ")}
            </div>
          </div>
          <button
            className="offer-detail__close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        {isLoading && (
          <div style={{ display: "grid", placeItems: "center", padding: 40 }}>
            <Spinner dark />
          </div>
        )}

        {isError && (
          <div className="offers-empty__text">Erreur de chargement.</div>
        )}

        {offer &&
          (offer.parsingStatus === "pending" ||
            offer.parsingStatus === "processing") && (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spinner dark />
              <p
                style={{
                  marginTop: 12,
                  color: "var(--text-muted)",
                  fontSize: 14,
                }}
              >
                L'IA analyse les exigences de cette offre…
              </p>
            </div>
          )}

        {offer && offer.parsingStatus === "failed" && (
          <div style={{ color: "var(--danger)", fontSize: 14 }}>
            L'analyse a échoué : {offer.parsingError || "erreur inconnue"}
          </div>
        )}

        {offer && offer.requirements && (
          <>
            {offer.requirements.summary && (
              <section className="offer-detail__section">
                <div className="offer-detail__section-title">Résumé</div>
                <p className="offer-detail__description">
                  {offer.requirements.summary}
                </p>
              </section>
            )}

            {offer.requirements.requiredSkills.length > 0 && (
              <section className="offer-detail__section">
                <div className="offer-detail__section-title">
                  Compétences requises
                </div>
                <div className="offer-card__skills">
                  {offer.requirements.requiredSkills.map((s) => (
                    <span key={s} className="skill-chip">
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {offer.requirements.preferredSkills.length > 0 && (
              <section className="offer-detail__section">
                <div className="offer-detail__section-title">
                  Compétences appréciées
                </div>
                <div className="offer-card__skills">
                  {offer.requirements.preferredSkills.map((s) => (
                    <span key={s} className="skill-chip">
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {offer.requirements.responsibilities.length > 0 && (
              <section className="offer-detail__section">
                <div className="offer-detail__section-title">
                  Responsabilités
                </div>
                <div className="offer-detail__list">
                  {offer.requirements.responsibilities.map((r, i) => (
                    <div className="offer-detail__item" key={i}>
                      {r}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <section className="offer-detail__section">
          <div className="offer-detail__section-title">
            Description originale
          </div>
          <p className="offer-detail__description">{offer?.description}</p>
        </section>

        {offer?.sourceUrl && (
          <a
            href={offer.sourceUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Voir l'annonce originale <ExternalLink size={13} />
          </a>
        )}
      </aside>
    </div>
  );
};
