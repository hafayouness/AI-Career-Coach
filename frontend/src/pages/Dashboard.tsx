import {
  FileText,
  Briefcase,
  Target,
  Sparkles,
  Send,
  Clock,
  Mic,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardStats, useRecentActivity } from "../hooks/useDashboard";
import { useAuthUser } from "../store/authStore";
import { Spinner, Button } from "../components/ui";

export const Dashboard = () => {
  const user = useAuthUser();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activity, isLoading: activityLoading } = useRecentActivity();
  console.log("Dashboard Stats:", stats);
  console.log("Recent Activity:", activity);

  const cards = [
    {
      label: "CV importés",
      value: stats?.cvs,
      icon: FileText,
      ai: false,
      link: "/cv",
    },
    {
      label: "Offres",
      value: stats?.offers,
      icon: Briefcase,
      ai: false,
      link: "/offers",
    },
    {
      label: "Analyses",
      value: stats?.analyses,
      icon: Target,
      ai: true,
      link: "/analyses",
    },
    {
      label: "CV adaptés",
      value: stats?.versions,
      icon: Sparkles,
      ai: true,
      link: "/cv-versions",
    },
    {
      label: "Présentations",
      value: stats?.presentations,
      icon: Mic,
      ai: true,
      link: "/presentations",
    },
    {
      label: "Candidatures",
      value: stats?.apps,
      icon: Send,
      ai: false,
      link: "/applications",
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
          Bonjour {user?.name?.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
          Voici un résumé de votre progression.
        </p>
      </div>

      <div className="dashboard__grid" style={{ marginBottom: 32 }}>
        {cards.map((s) => (
          <Link to={s.link} key={s.label} style={{ textDecoration: "none" }}>
            <div className="stat" style={{ cursor: "pointer" }}>
              <div className={`stat__icon ${s.ai ? "stat__icon--ai" : ""}`}>
                <s.icon size={20} />
              </div>
              <div className="stat__label">{s.label}</div>
              <div className="stat__value">
                {statsLoading ? <Spinner dark /> : (s.value ?? 0)}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="dashboard__two-col">
        <div className="card">
          <h2 className="dashboard__section-title">
            <Clock size={18} /> Activité récente
          </h2>

          {activityLoading && <Spinner dark />}

          {activity && activity.length === 0 && (
            <div className="empty">Aucune activité pour le moment.</div>
          )}

          {activity && activity.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {activity.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background:
                        item.type === "analysis"
                          ? "var(--primary-soft)"
                          : item.type === "version"
                            ? "var(--accent-soft)"
                            : "var(--surface-2)",
                      color:
                        item.type === "analysis"
                          ? "var(--primary)"
                          : item.type === "version"
                            ? "var(--accent-hover)"
                            : "var(--text-muted)",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {item.type === "analysis" ? (
                      <Target size={16} />
                    ) : item.type === "version" ? (
                      <Sparkles size={16} />
                    ) : (
                      <Send size={16} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.title}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {new Date(item.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  {item.score !== undefined && (
                    <div
                      style={{
                        fontWeight: 700,
                        color: "var(--primary)",
                        fontSize: 14,
                      }}
                    >
                      {item.score}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="dashboard__section-title">Actions rapides</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link to="/cv">
              <Button
                variant="ghost"
                full
                style={{ justifyContent: "space-between" }}
              >
                <span>
                  <FileText
                    size={16}
                    style={{ marginRight: 8, verticalAlign: "middle" }}
                  />{" "}
                  Importer un CV
                </span>
                <ArrowRight size={14} />
              </Button>
            </Link>
            <Link to="/offers">
              <Button
                variant="ghost"
                full
                style={{ justifyContent: "space-between" }}
              >
                <span>
                  <Briefcase
                    size={16}
                    style={{ marginRight: 8, verticalAlign: "middle" }}
                  />{" "}
                  Ajouter une offre
                </span>
                <ArrowRight size={14} />
              </Button>
            </Link>
            <Link to="/analyses">
              <Button
                variant="ai"
                full
                style={{ justifyContent: "space-between" }}
              >
                <span>
                  <Target
                    size={16}
                    style={{ marginRight: 8, verticalAlign: "middle" }}
                  />{" "}
                  Lancer une analyse
                </span>
                <ArrowRight size={14} />
              </Button>
            </Link>
            <Link to="/cv-versions">
              <Button
                variant="ghost"
                full
                style={{ justifyContent: "space-between" }}
              >
                <span>
                  <Sparkles
                    size={16}
                    style={{ marginRight: 8, verticalAlign: "middle" }}
                  />{" "}
                  Générer un CV adapté
                </span>
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
