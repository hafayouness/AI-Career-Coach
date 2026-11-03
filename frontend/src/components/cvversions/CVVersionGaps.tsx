import {
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  GraduationCap,
  Briefcase,
  Lightbulb,
  Plus,
} from "lucide-react";
import type { CVGap } from "../../types";

interface Props {
  gaps: CVGap;
  onAddSkill?: (skill: string) => void;
  isLocked?: boolean;
}

export const CVVersionGaps = ({
  gaps,
  onAddSkill,
  isLocked = false,
}: Props) => {
  const hasSkillsSection =
    gaps.skills.matched.length > 0 ||
    gaps.skills.missing.length > 0 ||
    gaps.skills.missingPreferred.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* COMPÉTENCES */}
      {hasSkillsSection && (
        <div className="card" style={{ padding: 16 }}>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <TrendingUp size={16} /> Compétences
          </h3>

          {/* Vous avez déjà */}
          {gaps.skills.matched.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--success)",
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <CheckCircle2 size={12} /> Vous avez déjà
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {gaps.skills.matched.map((s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: 11,
                      padding: "3px 8px",
                      borderRadius: 4,
                      background: "var(--success-soft)",
                      color: "#166534",
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Il manque (requis) — CLICKABLE */}
          {gaps.skills.missing.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--danger)",
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <AlertCircle size={12} /> Il manque (cliquez pour ajouter)
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {gaps.skills.missing.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onAddSkill?.(s)}
                    disabled={isLocked || !onAddSkill}
                    style={{
                      fontSize: 11,
                      padding: "4px 10px",
                      borderRadius: 4,
                      background: "var(--danger-soft)",
                      color: "#7f1d1d",
                      border: "1px solid #fecaca",
                      cursor:
                        isLocked || !onAddSkill ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontFamily: "inherit",
                      opacity: isLocked ? 0.5 : 1,
                    }}
                    title={
                      isLocked
                        ? "CV validé, impossible de modifier"
                        : "Cliquez pour ajouter cette compétence à votre CV"
                    }
                  >
                    <Plus size={10} /> {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bonus (apprécié) — CLICKABLE */}
          {gaps.skills.missingPreferred.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--warning)",
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Lightbulb size={12} /> Bonus (cliquez pour ajouter)
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {gaps.skills.missingPreferred.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onAddSkill?.(s)}
                    disabled={isLocked || !onAddSkill}
                    style={{
                      fontSize: 11,
                      padding: "4px 10px",
                      borderRadius: 4,
                      background: "var(--warning-soft)",
                      color: "#78350f",
                      border: "1px solid #fde68a",
                      cursor:
                        isLocked || !onAddSkill ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontFamily: "inherit",
                      opacity: isLocked ? 0.5 : 1,
                    }}
                    title={
                      isLocked
                        ? "CV validé, impossible de modifier"
                        : "Cliquez pour ajouter cette compétence à votre CV"
                    }
                  >
                    <Plus size={10} /> {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* EXPÉRIENCE */}
      {(gaps.experience.required || gaps.experience.totalYears > 0) && (
        <div className="card" style={{ padding: 16 }}>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Briefcase size={16} /> Expérience
          </h3>
          <div
            style={{
              fontSize: 12,
              display: "flex",
              alignItems: "flex-start",
              gap: 6,
              lineHeight: 1.5,
            }}
          >
            {gaps.experience.sufficient ? (
              <CheckCircle2
                size={14}
                color="var(--success)"
                style={{ flexShrink: 0, marginTop: 2 }}
              />
            ) : (
              <AlertCircle
                size={14}
                color="var(--danger)"
                style={{ flexShrink: 0, marginTop: 2 }}
              />
            )}
            <span>
              Vous avez{" "}
              <strong>
                {gaps.experience.totalYears} an
                {gaps.experience.totalYears > 1 ? "s" : ""}
              </strong>{" "}
              d'expérience.
              {gaps.experience.required && (
                <>
                  <br />
                  L'offre demande : <strong>{gaps.experience.required}</strong>.
                </>
              )}
            </span>
          </div>
          {!gaps.experience.sufficient && (
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: "var(--text-muted)",
                fontStyle: "italic",
              }}
            >
              💡 Ajoutez ou complétez une expérience ci-dessous pour combler cet
              écart.
            </div>
          )}
        </div>
      )}

      {/* FORMATION */}
      {gaps.education.required && (
        <div className="card" style={{ padding: 16 }}>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <GraduationCap size={16} /> Formation
          </h3>
          <div
            style={{
              fontSize: 12,
              display: "flex",
              alignItems: "flex-start",
              gap: 6,
              lineHeight: 1.5,
            }}
          >
            {gaps.education.sufficient ? (
              <CheckCircle2
                size={14}
                color="var(--success)"
                style={{ flexShrink: 0, marginTop: 2 }}
              />
            ) : (
              <AlertCircle
                size={14}
                color="var(--danger)"
                style={{ flexShrink: 0, marginTop: 2 }}
              />
            )}
            <span>
              L'offre demande : <strong>{gaps.education.required}</strong>
            </span>
          </div>
          {!gaps.education.sufficient && (
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: "var(--text-muted)",
                fontStyle: "italic",
              }}
            >
              💡 Ajoutez une formation ci-dessous si vous l'avez.
            </div>
          )}
        </div>
      )}

      {/* RECOMMANDATIONS */}
      {gaps.recommendations.length > 0 && (
        <div
          className="card"
          style={{
            padding: 16,
            background: "var(--ai-soft)",
            borderColor: "#d9f99d",
          }}
        >
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "var(--ai)",
            }}
          >
            💡 Recommandations
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {gaps.recommendations.map((rec, i) => (
              <div
                key={i}
                style={{
                  fontSize: 12,
                  padding: 10,
                  background: "var(--surface)",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    fontWeight: 500,
                    marginBottom: rec.suggestion ? 4 : 0,
                    lineHeight: 1.4,
                  }}
                >
                  {rec.message}
                </div>
                {rec.suggestion && (
                  <div
                    style={{
                      fontStyle: "italic",
                      color: "var(--text-muted)",
                      fontSize: 11,
                      lineHeight: 1.4,
                    }}
                  >
                    {rec.suggestion}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ÉTAT VIDE */}
      {!hasSkillsSection &&
        !gaps.experience.required &&
        !gaps.education.required &&
        gaps.recommendations.length === 0 && (
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <CheckCircle2
              size={32}
              color="var(--success)"
              style={{ marginBottom: 12 }}
            />
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
              Aucun écart détecté
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Votre CV couvre toutes les exigences de cette offre.
            </div>
          </div>
        )}
    </div>
  );
};
