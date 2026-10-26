import { type ChangeEvent, type DragEvent, useRef, useState } from "react";
import { UploadCloud, FileText } from "lucide-react";
import { useUploadCV } from "../../hooks/useCVs";
import { extractError } from "../../services/api";
import { Alert } from "../ui";
import { Spinner } from "../ui";

const MAX_SIZE_MB = 10;
const ALLOWED = [".pdf", ".docx"];

export const CVUpload = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragover, setDragover] = useState(false);
  const [localError, setLocalError] = useState("");
  const upload = useUploadCV();

  const handleFile = (file: File) => {
    setLocalError("");
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED.includes(ext)) {
      setLocalError("Seuls les fichiers PDF et DOCX sont acceptés.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setLocalError(`Le fichier dépasse ${MAX_SIZE_MB} Mo.`);
      return;
    }
    upload.mutate(file, {
      onError: (err) => setLocalError(extractError(err)),
    });
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragover(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      {(localError || upload.isError) && (
        <div style={{ marginBottom: 16 }}>
          <Alert variant="error">
            {localError || extractError(upload.error)}
          </Alert>
        </div>
      )}

      <div
        className={`cv-upload ${dragover ? "cv-upload--dragover" : ""} ${
          upload.isPending ? "cv-upload--busy" : ""
        }`}
        onClick={() => !upload.isPending && inputRef.current?.click()}
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
          accept=".pdf,.docx"
          className="cv-upload__input"
          onChange={onChange}
        />

        <div className="cv-upload__icon">
          {upload.isPending ? <Spinner dark /> : <UploadCloud size={24} />}
        </div>

        <div className="cv-upload__title">
          {upload.isPending ? "Import en cours…" : "Importer votre CV"}
        </div>
        <div className="cv-upload__hint">
          Glissez votre fichier ici ou{" "}
          <span className="cv-upload__browse">parcourez vos fichiers</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-light)" }}>
          <FileText
            size={12}
            style={{
              display: "inline",
              marginRight: 4,
              verticalAlign: "middle",
            }}
          />
          PDF ou DOCX · {MAX_SIZE_MB} Mo max
        </div>

        {upload.isPending && (
          <div className="cv-upload__progress">
            <Spinner dark /> Traitement et analyse IA en cours…
          </div>
        )}
      </div>
    </div>
  );
};
