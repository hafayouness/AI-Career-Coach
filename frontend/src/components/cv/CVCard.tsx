import { FileText, Trash2 } from "lucide-react";
import type { CV } from "../../types/index.ts";

interface Props {
  cv: CV;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const statusLabel: Record<CV["processingStatus"], string> = {
  pending: "En attente",
  processing: "Analyse en cours",
  completed: "Analysé",
  failed: "Échec",
};

export const CVCard = ({ cv, onClick, onDelete }: Props) => {
  const skills = cv.parsedData?.skills?.slice(0, 5) ?? [];

  return (
    <div className="cv-card" onClick={onClick}>
      <div className="cv-card__top">
        <div className="cv-card__icon">
          <FileText size={20} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="cv-card__name" title={cv.originalFileName}>
            {cv.originalFileName}
          </div>
          <div className="cv-card__meta">
            {new Date(cv.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            {" · "}
            {(cv.fileSize / 1024).toFixed(0)} Ko
          </div>
        </div>
      </div>

      <div className={`status-pill status-pill--${cv.processingStatus}`}>
        {statusLabel[cv.processingStatus]}
      </div>

      {skills.length > 0 && (
        <div className="cv-card__skills">
          {skills.map((s) => (
            <span key={s} className="skill-chip">
              {s}
            </span>
          ))}
          {(cv.parsedData?.skills?.length ?? 0) > 5 && (
            <span className="skill-chip">
              +{(cv.parsedData?.skills?.length ?? 0) - 5}
            </span>
          )}
        </div>
      )}

      <div className="cv-card__footer">
        <span style={{ fontSize: 12, color: "var(--text-light)" }}>
          {cv.processingStatus === "completed" && cv.parsedData?.name
            ? cv.parsedData.name
            : "—"}
        </span>
        <button
          className="cv-card__delete"
          onClick={onDelete}
          aria-label="Supprimer"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
