import { FileText, Sparkles } from "lucide-react";
import type { CVVersion } from "../../types";

interface Props {
  version: CVVersion;
}

export const CVVersionDiff = ({ version }: Props) => {
  const original = version.cv?.parsedData;
  const adapted = version.content;

  if (!original) {
    return (
      <div className="cvversion-flagged__empty">
        Données originales indisponibles.
      </div>
    );
  }

  return (
    <div className="cvversion-diff">
      <div className="cvversion-diff__col">
        <div className="cvversion-diff__col-title">
          <FileText size={14} /> CV original
        </div>

        {original.summary && (
          <div className="cvversion-diff__section">
            <div className="cvversion-diff__label">Résumé</div>
            <div className="cvversion-diff__text">{original.summary}</div>
          </div>
        )}

        {original.skills?.length > 0 && (
          <div className="cvversion-diff__section">
            <div className="cvversion-diff__label">Compétences</div>
            <div className="cvversion-diff__text">
              {original.skills.join(" · ")}
            </div>
          </div>
        )}

        {original.experiences?.length > 0 && (
          <div className="cvversion-diff__section">
            <div className="cvversion-diff__label">Expériences</div>
            {original.experiences.map((e, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div
                  className="cvversion-diff__text"
                  style={{ fontWeight: 600 }}
                >
                  {e.title}
                </div>
                <div
                  className="cvversion-diff__text"
                  style={{ fontSize: 12, color: "var(--text-muted)" }}
                >
                  {[e.company, e.startDate, e.endDate]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Adapté */}
      <div className="cvversion-diff__col">
        <div className="cvversion-diff__col-title">
          <Sparkles size={14} style={{ color: "var(--accent-hover)" }} /> CV
          adapté
        </div>

        {adapted.header.summary && (
          <div className="cvversion-diff__section">
            <div className="cvversion-diff__label">Résumé</div>
            <div className="cvversion-diff__text">{adapted.header.summary}</div>
          </div>
        )}

        {adapted.skills?.length > 0 && (
          <div className="cvversion-diff__section">
            <div className="cvversion-diff__label">Compétences</div>
            <div className="cvversion-diff__text">
              {adapted.skills.join(" · ")}
            </div>
          </div>
        )}

        {adapted.experiences?.length > 0 && (
          <div className="cvversion-diff__section">
            <div className="cvversion-diff__label">Expériences</div>
            {adapted.experiences.map((e, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div
                  className="cvversion-diff__text"
                  style={{ fontWeight: 600 }}
                >
                  {e.title}
                </div>
                <div
                  className="cvversion-diff__text"
                  style={{ fontSize: 12, color: "var(--text-muted)" }}
                >
                  {[e.company, e.startDate, e.endDate]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
