import { AlertTriangle, X } from "lucide-react";
import { Button } from "./Button";

interface Props {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDialog = ({
  open,
  title = "Confirmer la suppression",
  message,
  confirmLabel = "Supprimer",
  cancelLabel = "Annuler",
  variant = "danger",
  loading = false,
  onConfirm,
  onClose,
}: Props) => {
  if (!open) return null;

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div
        className="confirm-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          className="confirm-dialog__close"
          onClick={onClose}
          aria-label="Fermer"
          disabled={loading}
        >
          <X size={16} />
        </button>

        <div className="confirm-dialog__icon">
          <AlertTriangle size={22} />
        </div>

        <h3 className="confirm-dialog__title">{title}</h3>
        <p className="confirm-dialog__message">{message}</p>

        <div className="confirm-dialog__actions">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
