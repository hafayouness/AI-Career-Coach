import {
  FileText,
  Briefcase,
  Send,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "../components/ui";
import { useAuthUser } from "../store/authStore";

const stats = [
  { label: "CV importés", value: 0, icon: FileText, ai: false },
  { label: "Offres analysées", value: 0, icon: Briefcase, ai: false },
  { label: "Candidatures", value: 0, icon: Send, ai: false },
  { label: "Simulations", value: 0, icon: MessageSquare, ai: true },
];

export const Dashboard = () => {
  const user = useAuthUser();

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
          Bonjour {user?.name?.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
          Prêt à préparer votre prochaine opportunité ?
        </p>
      </div>

      <div className="dashboard__grid">
        {stats.map((s) => (
          <div className="stat" key={s.label}>
            <div className={`stat__icon ${s.ai ? "stat__icon--ai" : ""}`}>
              <s.icon size={20} />
            </div>
            <div className="stat__label">{s.label}</div>
            <div className="stat__value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="dashboard__two-col">
        <div className="card">
          <h2 className="dashboard__section-title">
            <Sparkles size={18} /> Commencez ici
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: 14,
              marginBottom: 16,
            }}
          >
            Importez votre CV, ajoutez une offre et laissez l'IA préparer votre
            prochain entretien.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Button variant="primary">Importer mon CV</Button>
            <Button variant="ai">Générer mon pitch</Button>
          </div>
        </div>

        <div className="card">
          <h2 className="dashboard__section-title">Activité récente</h2>
          <div className="empty">Aucune activité pour le moment.</div>
        </div>
      </div>
    </>
  );
};
