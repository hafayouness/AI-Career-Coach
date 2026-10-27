import { FileText, Trash2, ShieldCheck, ShieldAlert } from "lucide-react";
import type { CVVersion } from "../../types";

interface Props {
  version: CVVersion;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const CVVersionCard = ({ version, onClick, onDelete }: Props) => {
  const hasFlags =
    (version.changeSummary?.flaggedClaims?.length ?? 0) > 0 ||
    (version.changeSummary?.antiInventionIssues?.length ?? 0) > 0;

  return (
    <div className="cvversion-card" onClick={onClick}>
      <div className="cvversion-card__top">
        <div className="cvversion-card__icon">
          <FileText size={20} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            className="cvversion-card__title"
            title={version.jobOffer?.title || "CV adapté"}
          >
            {version.jobOffer?.title || "CV adapté"}
          </div>
          <div className="cvversion-card__meta">
            v{version.versionNumber} · {version.jobOffer?.company || "—"}
          </div>
        </div>
      </div>

      <div className="cvversion-card__badges">
        {version.validated ? (
          <span className="version-badge version-badge--validated">
            <ShieldCheck size={11} /> Validé
          </span>
        ) : (
          <span className="version-badge version-badge--draft">Brouillon</span>
        )}
        {hasFlags && (
          <span className="version-badge version-badge--flagged">
            <ShieldAlert size={11} /> À vérifier
          </span>
        )}
      </div>

      <div className="cvversion-card__footer">
        <span style={{ fontSize: 12, color: "var(--text-light)" }}>
          {new Date(version.createdAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
        <button
          className="cvversion-card__delete"
          onClick={onDelete}
          aria-label="Supprimer"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
