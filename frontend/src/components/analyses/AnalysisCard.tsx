import { Trash2, FileText } from "lucide-react";
import type { JobAnalysis } from "../../types";
import { ScoreRing } from "./ScoreRing";

interface Props {
  analysis: JobAnalysis;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const AnalysisCard = ({ analysis, onClick, onDelete }: Props) => {
  const offer = analysis.jobOffer;
  const cv = analysis.cv;

  return (
    <div className="analysis-card" onClick={onClick}>
      <div className="analysis-card__top">
        <ScoreRing score={analysis.matchingScore} size={78} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="analysis-card__title">{offer?.title || "Offre"}</div>
          <div className="analysis-card__meta">
            {offer?.company || "—"}
            {offer?.location ? ` · ${offer.location}` : ""}
          </div>
          <div className="analysis-card__cv">
            <FileText size={11} />{" "}
            {cv?.parsedData?.name || cv?.originalFileName || "CV"}
          </div>
        </div>
      </div>

      {analysis.matchingDetails.matchedSkills.length > 0 && (
        <div className="analysis-card__skills">
          {analysis.matchingDetails.matchedSkills.slice(0, 4).map((s) => (
            <span key={s} className="skill-chip skill-chip--match">
              {s}
            </span>
          ))}
          {analysis.matchingDetails.matchedSkills.length > 4 && (
            <span className="skill-chip">
              +{analysis.matchingDetails.matchedSkills.length - 4}
            </span>
          )}
        </div>
      )}

      {analysis.matchingDetails.missingSkills.length > 0 && (
        <div className="analysis-card__skills">
          {analysis.matchingDetails.missingSkills.slice(0, 3).map((s) => (
            <span key={s} className="skill-chip skill-chip--missing">
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="analysis-card__footer">
        <span style={{ fontSize: 12, color: "var(--text-light)" }}>
          {new Date(analysis.createdAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
        <button
          className="analysis-card__delete"
          onClick={onDelete}
          aria-label="Supprimer"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
