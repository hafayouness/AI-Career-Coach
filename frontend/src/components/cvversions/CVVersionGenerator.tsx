import { type FormEvent, useState } from "react";
import { X, Sparkles, FileText, Briefcase } from "lucide-react";
import { Button, Alert, Spinner } from "../ui";
import { useCVs } from "../../hooks/useCVs";
import { useJobOffers } from "../../hooks/useJobOffers";
import { useJobAnalyses } from "../../hooks/useJobAnalyses";

interface Props {
  onClose: () => void;
  onSuccess: (cvId: number, jobOfferId: number) => void;
}

export const CVVersionGenerator = ({ onClose, onSuccess }: Props) => {
  const { data: cvs, isLoading: cvsLoading } = useCVs();
  const { data: offers, isLoading: offersLoading } = useJobOffers();
  const { data: analyses, isLoading: analysesLoading } = useJobAnalyses();

  const [cvId, setCvId] = useState<number | "">("");
  const [jobOfferId, setJobOfferId] = useState<number | "">("");

  const readyCVs = cvs?.filter((c) => c.processingStatus === "completed") ?? [];
  const readyOffers =
    offers?.filter((o) => o.parsingStatus === "completed") ?? [];

  const availableOfferIds = new Set(
    analyses
      ?.filter((a) => (cvId ? a.cvId === Number(cvId) : true))
      .map((a) => a.jobOfferId) ?? [],
  );
  const selectableOffers = readyOffers.filter((o) =>
    availableOfferIds.has(o.id),
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!cvId || !jobOfferId) return;
    onSuccess(Number(cvId), Number(jobOfferId));
  };

  const loading = cvsLoading || offersLoading || analysesLoading;

  return (
    <div className="offer-form-overlay" onClick={onClose}>
      <form
        className="offer-form"
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
      >
        <div className="offer-form__header">
          <h2 className="offer-form__title">Générer un CV adapté</h2>
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
          <Alert variant="info">
            Aucun CV analysé. Importez et analysez un CV d'abord.
          </Alert>
        )}

        {!loading && readyCVs.length > 0 && (
          <div className="field">
            <label htmlFor="cv">
              <FileText
                size={14}
                style={{ verticalAlign: "middle", marginRight: 6 }}
              />
              CV source
            </label>
            <select
              id="cv"
              className="input"
              value={cvId}
              onChange={(e) => {
                setCvId(e.target.value ? Number(e.target.value) : "");
                setJobOfferId("");
              }}
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

        {!loading && cvId !== "" && selectableOffers.length === 0 && (
          <Alert variant="info">
            Aucune offre analysée pour ce CV. Lancez d'abord une analyse de
            correspondance.
          </Alert>
        )}

        {!loading && selectableOffers.length > 0 && (
          <div className="field">
            <label htmlFor="offer">
              <Briefcase
                size={14}
                style={{ verticalAlign: "middle", marginRight: 6 }}
              />
              Offre cible (analyses disponibles)
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
              {selectableOffers.map((o) => (
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
          <Button type="submit" variant="ai" disabled={!cvId || !jobOfferId}>
            <Sparkles size={16} /> Générer le CV
          </Button>
        </div>
      </form>
    </div>
  );
};
