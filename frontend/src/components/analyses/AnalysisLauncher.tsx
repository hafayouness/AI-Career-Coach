import { type FormEvent, useState } from "react";
import { X, Sparkles, FileText, Briefcase } from "lucide-react";
import { Button, Alert, Spinner } from "../ui";
import { useCVs } from "../../hooks/useCVs";
import { useJobOffers } from "../../hooks/useJobOffers";

interface Props {
  onClose: () => void;
  onSubmit: (cvId: number, jobOfferId: number) => void;
}

export const AnalysisLauncher = ({ onClose, onSubmit }: Props) => {
  const { data: cvs, isLoading: cvsLoading } = useCVs();
  const { data: offers, isLoading: offersLoading } = useJobOffers();
  const [cvId, setCvId] = useState<number | "">("");
  const [jobOfferId, setJobOfferId] = useState<number | "">("");

  const readyCVs = cvs?.filter((c) => c.processingStatus === "completed") ?? [];
  const readyOffers =
    offers?.filter((o) => o.parsingStatus === "completed") ?? [];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!cvId || !jobOfferId) return;
    onSubmit(Number(cvId), Number(jobOfferId)); // ← remonte au parent
  };

  const loading = cvsLoading || offersLoading;

  return (
    <div className="offer-form-overlay" onClick={onClose}>
      <form
        className="offer-form"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <div className="offer-form__header">
          <h2 className="offer-form__title">Nouvelle analyse</h2>
          <button
            type="button"
            className="offer-form__close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        {loading && (
          <div style={{ display: "grid", placeItems: "center", padding: 30 }}>
            <Spinner dark />
          </div>
        )}

        {!loading && readyCVs.length === 0 && (
          <Alert variant="info">Aucun CV analysé.</Alert>
        )}
        {!loading && readyOffers.length === 0 && (
          <Alert variant="info">Aucune offre analysée.</Alert>
        )}

        {!loading && readyCVs.length > 0 && (
          <div className="field">
            <label htmlFor="cv">
              <FileText
                size={14}
                style={{ verticalAlign: "middle", marginRight: 6 }}
              />
              CV à comparer
            </label>
            <select
              id="cv"
              className="input"
              value={cvId}
              onChange={(e) =>
                setCvId(e.target.value ? Number(e.target.value) : "")
              }
              required
            >
              <option value="">— Sélectionner un CV —</option>
              {readyCVs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.parsedData?.name || c.originalFileName}
                </option>
              ))}
            </select>
          </div>
        )}

        {!loading && readyOffers.length > 0 && (
          <div className="field">
            <label htmlFor="offer">
              <Briefcase
                size={14}
                style={{ verticalAlign: "middle", marginRight: 6 }}
              />
              Offre d'emploi
            </label>
            <select
              id="offer"
              className="input"
              value={jobOfferId}
              onChange={(e) =>
                setJobOfferId(e.target.value ? Number(e.target.value) : "")
              }
              required
            >
              <option value="">— Sélectionner une offre —</option>
              {readyOffers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                  {o.company ? ` — ${o.company}` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="offer-form__actions">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="ai"
            disabled={
              !cvId ||
              !jobOfferId ||
              readyCVs.length === 0 ||
              readyOffers.length === 0
            }
          >
            <Sparkles size={16} /> Lancer l'analyse
          </Button>
        </div>
      </form>
    </div>
  );
};
