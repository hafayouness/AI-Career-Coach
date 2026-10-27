import { ArrowUpRight, RefreshCw, Sparkles } from "lucide-react";
import type { CVVersion } from "../../types";

interface Props {
  version: CVVersion;
}

export const CVVersionChanges = ({ version }: Props) => {
  const summary = version.changeSummary;
  if (!summary) {
    return (
      <div className="cvversion-flagged__empty">
        Aucun détail de changement disponible.
      </div>
    );
  }

  const groups = [
    {
      title: "Éléments mis en avant",
      items: summary.highlighted,
      icon: <Sparkles size={14} style={{ color: "var(--accent-hover)" }} />,
    },
    {
      title: "Éléments reformulés",
      items: summary.reformulated,
      icon: <RefreshCw size={14} style={{ color: "var(--primary)" }} />,
    },
    {
      title: "Sections réorganisées",
      items: summary.reorganized,
      icon: <ArrowUpRight size={14} style={{ color: "var(--text-muted)" }} />,
    },
  ];

  const visibleGroups = groups.filter((g) => g.items && g.items.length > 0);

  if (visibleGroups.length === 0) {
    return (
      <div className="cvversion-flagged__empty">
        Aucun changement détaillé n'a été signalé.
      </div>
    );
  }

  return (
    <div className="cvversion-changes">
      {visibleGroups.map((g) => (
        <div className="cvversion-changes__group" key={g.title}>
          <div className="cvversion-changes__title">
            {g.icon} {g.title}
          </div>
          <ul className="cvversion-changes__list">
            {g.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
