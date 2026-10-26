import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  useRef,
  useState,
} from "react";
import { X, Image as ImageIcon, Keyboard } from "lucide-react";
import { Button, Input, Alert, Spinner } from "../ui";
import {
  useCreateJobOffer,
  useExtractJobOfferFromImage,
} from "../../hooks/useJobOffers";
import { extractError } from "../../services/api";

interface Props {
  onClose: () => void;
}

type Mode = "manual" | "image";

export const JobOfferForm = ({ onClose }: Props) => {
  const [mode, setMode] = useState<Mode>("manual");

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [description, setDescription] = useState("");
  const create = useCreateJobOffer();

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragover, setDragover] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const extract = useExtractJobOfferFromImage();

  const onSubmitManual = (e: FormEvent) => {
    e.preventDefault();
    create.mutate(
      {
        title: title.trim(),
        company: company.trim() || null,
        location: location.trim() || null,
        sourceUrl: sourceUrl.trim() || null,
        description: description.trim(),
      },
      { onSuccess: onClose },
    );
  };

  const handleImageFile = (file: File) => {
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const onImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleImageFile(f);
    e.target.value = "";
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragover(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleImageFile(f);
  };

  const onExtract = () => {
    if (!imageFile) return;
    extract.mutate(imageFile, {
      onSuccess: () => onClose(),
    });
  };

  const busy = create.isPending || extract.isPending;

  return (
    <div className="offer-form-overlay" onClick={onClose}>
      <div className="offer-form" onClick={(e) => e.stopPropagation()}>
        <div className="offer-form__header">
          <h2 className="offer-form__title">Nouvelle offre</h2>
          <button
            type="button"
            className="offer-form__close"
            onClick={onClose}
            aria-label="Fermer"
            disabled={busy}
          >
            <X size={16} />
          </button>
        </div>

        {/* Onglets */}
        <div className="offer-form__tabs">
          <button
            type="button"
            className={`offer-form__tab ${
              mode === "manual" ? "offer-form__tab--active" : ""
            }`}
            onClick={() => setMode("manual")}
            disabled={busy}
          >
            <Keyboard size={14} /> Coller le texte
          </button>
          <button
            type="button"
            className={`offer-form__tab ${
              mode === "image" ? "offer-form__tab--active" : ""
            }`}
            onClick={() => setMode("image")}
            disabled={busy}
          >
            <ImageIcon size={14} /> Importer une capture
          </button>
        </div>

        {mode === "manual" && (
          <form onSubmit={onSubmitManual} style={{ display: "contents" }}>
            {create.isError && (
              <Alert variant="error">{extractError(create.error)}</Alert>
            )}

            <Input
              id="title"
              label="Titre du poste"
              placeholder="Développeur Full Stack"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="offer-form__row">
              <Input
                id="company"
                label="Entreprise"
                placeholder="Acme Corp"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
              <Input
                id="location"
                label="Lieu"
                placeholder="Paris, France"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <Input
              id="sourceUrl"
              label="Lien de l'annonce (optionnel)"
              type="url"
              placeholder="https://..."
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />

            <div className="field">
              <label htmlFor="description">Description du poste</label>
              <textarea
                id="description"
                className="input"
                placeholder="Collez ici la description complète de l'offre..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                minLength={30}
                required
              />
              <span className="field__hint">
                {description.length} caractères · minimum 30
              </span>
            </div>

            <div className="offer-form__actions">
              <Button type="button" variant="ghost" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" loading={create.isPending}>
                Enregistrer et analyser
              </Button>
            </div>
          </form>
        )}

        {mode === "image" && (
          <>
            {extract.isError && (
              <Alert variant="error">{extractError(extract.error)}</Alert>
            )}

            <div
              className={`cv-upload ${dragover ? "cv-upload--dragover" : ""} ${
                busy ? "cv-upload--busy" : ""
              }`}
              onClick={() => !busy && inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragover(true);
              }}
              onDragLeave={() => setDragover(false)}
              onDrop={onDrop}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="cv-upload__input"
                onChange={onImageChange}
              />

              {preview ? (
                <img
                  src={preview}
                  alt="Aperçu"
                  style={{
                    maxWidth: "100%",
                    maxHeight: 240,
                    borderRadius: 8,
                    objectFit: "contain",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
              ) : (
                <>
                  <div className="cv-upload__icon">
                    <ImageIcon size={24} />
                  </div>
                  <div className="cv-upload__title">
                    Capture d'écran de l'offre
                  </div>
                  <div className="cv-upload__hint">
                    Glissez l'image ici ou{" "}
                    <span className="cv-upload__browse">parcourez</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-light)" }}>
                    JPG, PNG ou WEBP · 10 Mo max
                  </div>
                </>
              )}
            </div>

            {busy && (
              <div className="cv-upload__progress">
                <Spinner dark />
                {extract.isPending
                  ? "Lecture OCR et analyse IA en cours… (10–20 s)"
                  : "Enregistrement…"}
              </div>
            )}

            <div className="offer-form__actions">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={busy}
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={onExtract}
                loading={extract.isPending}
                disabled={!imageFile || busy}
              >
                <ImageIcon size={16} /> Extraire et enregistrer
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
