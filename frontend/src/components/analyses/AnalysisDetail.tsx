import {
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useJobAnalysis } from "../../hooks/useJobAnalyses";
import { Spinner } from "../ui";
import { ScoreRing } from "./ScoreRing";

interface Props {
  analysisId: number;
  onClose: () => void;
}

export const AnalysisDetail = ({ analysisId, onClose }: Props) => {
  const { data: analysis, isLoading, isError } = useJobAnalysis(analysisId);

  return (
    <div className="analysis-detail-overlay" onClick={onClose}>
      <aside className="analysis-detail" onClick={(e) => e.stopPropagation()}>
        <div className="analysis-detail__header">
          <div style={{ minWidth: 0 }}>
            <h2 className="analysis-detail__title">
              {analysis?.jobOffer?.title || "Analyse"}
            </h2>
            <div className="analysis-detail__meta">
              {[
                analysis?.jobOffer?.company,
                analysis?.jobOffer?.location,
                analysis?.cv?.parsedData?.name ||
                  analysis?.cv?.originalFileName,
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
          <button
            className="analysis-detail__close"
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
          <div style={{ color: "var(--danger)", fontSize: 14 }}>
            Erreur de chargement de l'analyse.
          </div>
        )}

        {analysis && (
          <>
            <section className="analysis-detail__score-block">
              <ScoreRing score={analysis.matchingScore} size={140} />
              <div className="analysis-detail__score-text">
                <div className="analysis-detail__score-label">
                  Score indicatif de correspondance
                </div>
                <div className="analysis-detail__score-desc">
                  Basé sur la comparaison du CV et des exigences de l'offre. Ce
                  score ne prédit pas une probabilité d'embauche.
                </div>
              </div>
            </section>

            {analysis.matchingDetails.matchedSkills.length > 0 && (
              <section className="analysis-detail__section">
                <div className="analysis-detail__section-title">
                  <CheckCircle2 size={14} style={{ color: "var(--success)" }} />
                  Compétences correspondantes
                </div>
                <div className="analysis-card__skills">
                  {analysis.matchingDetails.matchedSkills.map((s) => (
                    <span key={s} className="skill-chip skill-chip--match">
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {analysis.matchingDetails.missingSkills.length > 0 && (
              <section className="analysis-detail__section">
                <div className="analysis-detail__section-title">
                  <AlertCircle size={14} style={{ color: "var(--warning)" }} />
                  Compétences non identifiées dans le CV
                </div>
                <div className="analysis-card__skills">
                  {analysis.matchingDetails.missingSkills.map((s) => (
                    <span key={s} className="skill-chip skill-chip--missing">
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {analysis.matchingDetails.matchedRequirements.length > 0 && (
              <section className="analysis-detail__section">
                <div className="analysis-detail__section-title">
                  Exigences satisfaites
                </div>
                <div className="analysis-detail__list">
                  {analysis.matchingDetails.matchedRequirements.map((r, i) => (
                    <div className="analysis-detail__item" key={i}>
                      <div className="analysis-detail__item-title">
                        {r.requirement}
                      </div>
                      <div className="analysis-detail__item-evidence">
                        <CheckCircle2
                          size={12}
                          style={{ color: "var(--success)", flexShrink: 0 }}
                        />
                        {r.evidence}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {analysis.matchingDetails.missingRequirements.length > 0 && (
              <section className="analysis-detail__section">
                <div className="analysis-detail__section-title">
                  Exigences non satisfaites ou incertaines
                </div>
                <div className="analysis-detail__list">
                  {analysis.matchingDetails.missingRequirements.map((r, i) => (
                    <div className="analysis-detail__item" key={i}>
                      <div className="analysis-detail__item-title">
                        {r.requirement}
                      </div>
                      <div className="analysis-detail__item-reason">
                        <AlertCircle
                          size={12}
                          style={{ color: "var(--warning)", flexShrink: 0 }}
                        />
                        {r.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {analysis.matchingDetails.relevantExperiences.length > 0 && (
              <section className="analysis-detail__section">
                <div className="analysis-detail__section-title">
                  <TrendingUp size={14} /> Expériences pertinentes
                </div>
                <div className="analysis-detail__list">
                  {analysis.matchingDetails.relevantExperiences.map((e, i) => (
                    <div className="analysis-detail__item" key={i}>
                      <div className="analysis-detail__item-title">
                        {e.title}
                        {e.company ? ` · ${e.company}` : ""}
                      </div>
                      <div className="analysis-detail__item-desc">
                        {e.relevance}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {analysis.recommendations?.list &&
              analysis.recommendations.list.length > 0 && (
                <section className="analysis-detail__section">
                  <div className="analysis-detail__section-title">
                    <Sparkles size={14} style={{ color: "var(--ai)" }} />
                    Recommandations
                  </div>
                  <div className="analysis-detail__list">
                    {analysis.recommendations.list.map((r, i) => (
                      <div className="analysis-detail__item" key={i}>
                        {r}
                      </div>
                    ))}
                  </div>
                </section>
              )}

            {analysis.recommendations?.atsKeywords &&
              analysis.recommendations.atsKeywords.length > 0 && (
                <section className="analysis-detail__section">
                  <div className="analysis-detail__section-title">
                    Mots-clés ATS
                  </div>
                  <div className="analysis-card__skills">
                    {analysis.recommendations.atsKeywords.map((k) => (
                      <span key={k} className="skill-chip">
                        {k}
                      </span>
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
