import { X } from "lucide-react";
import { useCV } from "../../hooks/useCVs";
import { Spinner } from "../ui";

interface Props {
  cvId: number;
  onClose: () => void;
}

export const CVDetail = ({ cvId, onClose }: Props) => {
  const { data: cv, isLoading, isError } = useCV(cvId);

  return (
    <div className="cv-detail-overlay" onClick={onClose}>
      <aside className="cv-detail" onClick={(e) => e.stopPropagation()}>
        <div className="cv-detail__header">
          <div style={{ minWidth: 0 }}>
            <h2 className="cv-detail__title">{cv?.parsedData?.name || "CV"}</h2>
            <div className="cv-detail__filename">{cv?.originalFileName}</div>
          </div>
          <button
            className="cv-detail__close"
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
          <div className="cv-detail__empty">Erreur de chargement du CV.</div>
        )}

        {cv &&
          (cv.processingStatus === "pending" ||
            cv.processingStatus === "processing") && (
            <div className="cv-detail__empty">
              <Spinner dark />
              <p style={{ marginTop: 12 }}>
                L'IA analyse votre CV… Cela prend généralement 3 à 10 secondes.
              </p>
            </div>
          )}

        {cv && cv.processingStatus === "failed" && (
          <div className="cv-detail__empty" style={{ color: "var(--danger)" }}>
            L'analyse a échoué : {cv.processingError || "erreur inconnue"}
          </div>
        )}

        {cv && cv.processingStatus === "completed" && cv.parsedData && (
          <>
            {cv.parsedData.summary && (
              <section className="cv-detail__section">
                <div className="cv-detail__section-title">Résumé</div>
                <p className="cv-detail__summary">{cv.parsedData.summary}</p>
              </section>
            )}

            {cv.parsedData.skills.length > 0 && (
              <section className="cv-detail__section">
                <div className="cv-detail__section-title">Compétences</div>
                <div className="cv-card__skills">
                  {cv.parsedData.skills.map((s) => (
                    <span key={s} className="skill-chip">
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {cv.parsedData.experiences.length > 0 && (
              <section className="cv-detail__section">
                <div className="cv-detail__section-title">Expériences</div>
                <div className="cv-detail__list">
                  {cv.parsedData.experiences.map((e, i) => (
                    <div className="cv-detail__item" key={i}>
                      <div className="cv-detail__item-title">{e.title}</div>
                      <div className="cv-detail__item-meta">
                        {[e.company, e.startDate, e.endDate]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                      {e.description && (
                        <div className="cv-detail__item-desc">
                          {e.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {cv.parsedData.education.length > 0 && (
              <section className="cv-detail__section">
                <div className="cv-detail__section-title">Formation</div>
                <div className="cv-detail__list">
                  {cv.parsedData.education.map((e, i) => (
                    <div className="cv-detail__item" key={i}>
                      <div className="cv-detail__item-title">{e.degree}</div>
                      <div className="cv-detail__item-meta">
                        {[e.institution, e.year].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {cv.parsedData.languages.length > 0 && (
              <section className="cv-detail__section">
                <div className="cv-detail__section-title">Langues</div>
                <div className="cv-card__skills">
                  {cv.parsedData.languages.map((l, i) => (
                    <span key={i} className="skill-chip">
                      {l.language}
                      {l.level ? ` · ${l.level}` : ""}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {cv.parsedData.certifications.length > 0 && (
              <section className="cv-detail__section">
                <div className="cv-detail__section-title">Certifications</div>
                <div className="cv-detail__list">
                  {cv.parsedData.certifications.map((c, i) => (
                    <div className="cv-detail__item" key={i}>
                      <div className="cv-detail__item-title">{c}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {cv.parsedData.projects.length > 0 && (
              <section className="cv-detail__section">
                <div className="cv-detail__section-title">Projets</div>
                <div className="cv-detail__list">
                  {cv.parsedData.projects.map((p, i) => (
                    <div className="cv-detail__item" key={i}>
                      <div className="cv-detail__item-title">{p.name}</div>
                      {p.description && (
                        <div className="cv-detail__item-desc">
                          {p.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </aside>
    </div>
  );
};
