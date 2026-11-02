import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useToastStore } from "../../store/toastStore";

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`alert alert--${t.type === "success" ? "success" : t.type === "error" ? "error" : "info"}`}
          style={{
            minWidth: 300,
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "var(--shadow-lg)",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <span style={{ flexShrink: 0 }}>
            {t.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : t.type === "error" ? (
              <AlertCircle size={18} />
            ) : (
              <Info size={18} />
            )}
          </span>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>
            {t.message}
          </span>
          <button
            onClick={() => removeToast(t.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "inherit",
              opacity: 0.5,
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
