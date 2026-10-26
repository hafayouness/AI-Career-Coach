import { useState } from "react";
import { Sparkles, Target } from "lucide-react";
import {
  useJobAnalyses,
  useDeleteAnalysis,
  useRunAnalysis,
} from "../hooks/useJobAnalyses";
import { AnalysisLauncher } from "../components/analyses/AnalysisLauncher";
import { AnalysisLoader } from "../components/analyses/AnalysisLoader";
import { AnalysisCard } from "../components/analyses/AnalysisCard";
import { AnalysisDetail } from "../components/analyses/AnalysisDetail";
import { Spinner, Alert, Button } from "../components/ui";
import { extractError } from "../services/api";

export const JobAnalysesPage = () => {
  const { data: analyses, isLoading, isError } = useJobAnalyses();
  const deleteAnalysis = useDeleteAnalysis();
  const runAnalysis = useRunAnalysis();

  const [showLauncher, setShowLauncher] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleLaunch = (cvId: number, jobOfferId: number) => {
    setShowLauncher(false);
    setError("");

    runAnalysis.mutate(
      { cvId, jobOfferId },
      {
        onSuccess: (analysis) => {
          setOpenId(analysis.id); // ✅ ouvre le détail
        },
        onError: (err) => {
          setError(extractError(err)); // ✅ affiche l'erreur
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    if (confirm("Supprimer cette analyse ?")) deleteAnalysis.mutate(id);
  };

  return (
    <>
      <div className="offers-page__header">
        <div>
          <h1 className="offers-page__title">Analyses</h1>
          <p className="offers-page__subtitle">
            Comparez votre CV à une offre pour identifier vos forces et vos
            lacunes.
          </p>
        </div>
        <Button variant="ai" onClick={() => setShowLauncher(true)}>
          <Sparkles size={16} /> Nouvelle analyse
        </Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {isLoading && (
        <div style={{ display: "grid", placeItems: "center", padding: 60 }}>
          <Spinner dark />
        </div>
      )}

      {isError && (
        <Alert variant="error">Impossible de charger les analyses.</Alert>
      )}

      {analyses && analyses.length === 0 && !runAnalysis.isPending && (
        <div className="offers-empty">
          <div className="offers-empty__icon">
            <Target size={28} />
          </div>
          <div className="offers-empty__title">Aucune analyse</div>
          <div className="offers-empty__text">
            Comparez votre premier CV à une offre pour découvrir votre score.
          </div>
          <Button variant="ai" onClick={() => setShowLauncher(true)}>
            <Sparkles size={16} /> Lancer une analyse
          </Button>
        </div>
      )}

      {analyses && analyses.length > 0 && (
        <div className="analyses-grid">
          {analyses.map((a) => (
            <AnalysisCard
              key={a.id}
              analysis={a}
              onClick={() => setOpenId(a.id)}
              onDelete={(e) => {
                e.stopPropagation();
                handleDelete(a.id);
              }}
            />
          ))}
        </div>
      )}

      {showLauncher && (
        <AnalysisLauncher
          onClose={() => setShowLauncher(false)}
          onSubmit={handleLaunch}
        />
      )}

      {runAnalysis.isPending && (
        <div className="analysis-loader-overlay">
          <AnalysisLoader />
        </div>
      )}

      {openId !== null && (
        <AnalysisDetail analysisId={openId} onClose={() => setOpenId(null)} />
      )}
    </>
  );
};
