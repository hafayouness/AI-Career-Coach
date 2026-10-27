import { AlertTriangle, ShieldCheck } from "lucide-react";
import type { CVVersion } from "../../types";

interface Props {
  version: CVVersion;
}

export const CVVersionFlagged = ({ version }: Props) => {
  const issues = version.changeSummary?.antiInventionIssues ?? [];
  const flagged = version.changeSummary?.flaggedClaims ?? [];

  const hasIssues = issues.length > 0 || flagged.length > 0;

  if (!hasIssues) {
    return (
      <div className="cvversion-flagged__empty">
        <div className="cvversion-flagged__empty-icon">
          <ShieldCheck size={24} />
        </div>
        <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--text)" }}>
          Aucune alerte
        </div>
        <div>
          Aucune affirmation non justifiée détectée. Le CV respecte fidèlement
          votre CV original.
        </div>
      </div>
    );
  }

  return (
    <div className="cvversion-flagged">
      <div className="cvversion-flagged__banner">
        <AlertTriangle
          size={18}
          className="cvversion-flagged__banner-icon"
          style={{ color: "#b45309" }}
        />
        <div>
          <strong>Attention :</strong> certains éléments générés ne sont pas
          confirmés par votre CV original. Vérifiez et corrigez avant de
          valider.
        </div>
      </div>

      {issues.map((issue, i) => (
        <div className="cvversion-flagged__item" key={`i-${i}`}>
          <div className="cvversion-flagged__item-type">{issue.type}</div>
          <div className="cvversion-flagged__item-value">{issue.value}</div>
          <div className="cvversion-flagged__item-reason">{issue.reason}</div>
        </div>
      ))}

      {flagged.map((f, i) => (
        <div className="cvversion-flagged__item" key={`f-${i}`}>
          <div className="cvversion-flagged__item-type">affirmation IA</div>
          <div className="cvversion-flagged__item-value">{f}</div>
        </div>
      ))}
    </div>
  );
};
