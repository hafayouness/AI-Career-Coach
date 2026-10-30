import { useState } from "react";
import { Plus, Trash2, Building2, Calendar, GripVertical } from "lucide-react";
import {
  useApplications,
  useUpdateApplication,
  useDeleteApplication,
  useCreateApplication,
} from "../hooks/useApplications";
import { useJobOffers } from "../hooks/useJobOffers";
import { Button, Spinner, ConfirmDialog } from "../components/ui";

const COLUMNS = [
  { id: "to_prepare", label: "À préparer", color: "#f8fafc" },
  { id: "sent", label: "Envoyée", color: "#eff6ff" },
  { id: "interview_scheduled", label: "Entretien prévu", color: "#fefce8" },
  { id: "interview_done", label: "Entretien réalisé", color: "#f3e8ff" },
  { id: "offer_received", label: "Offre reçue", color: "#ecfdf5" },
  { id: "rejected", label: "Refusée", color: "#fef2f2" },
  { id: "withdrawn", label: "Retirée", color: "#f5f5f5" },
];

export const ApplicationsPage = () => {
  const { data: apps, isLoading } = useApplications();
  const { data: offers } = useJobOffers();
  const create = useCreateApplication();
  const update = useUpdateApplication();
  const del = useDeleteApplication();

  const [toDelete, setToDelete] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newOfferId, setNewOfferId] = useState("");
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData("appId"));
    if (id) update.mutate({ id, status });
  };

  const handleCreate = () => {
    if (!newOfferId) return;
    create.mutate({ jobOfferId: Number(newOfferId), status: "to_prepare" });
    setNewOfferId("");
    setShowForm(false);
  };

  return (
    <>
      <div className="cvversions-page__header">
        <div>
          <h1 className="cvversions-page__title">Candidatures</h1>
          <p className="cvversions-page__subtitle">
            Suivez l'évolution de vos candidatures, glissez-déposez pour changer
            de statut.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Nouvelle candidature
        </Button>
      </div>

      {/* Formulaire de création (modale) */}
      {showForm && (
        <div className="offer-form-overlay" onClick={() => setShowForm(false)}>
          <div
            className="offer-form"
            onClick={(e) => e.stopPropagation()}
            style={{ height: "auto", maxHeight: "80vh" }}
          >
            <div className="offer-form__header">
              <h2 className="offer-form__title">Nouvelle candidature</h2>
            </div>
            <div className="field">
              <label>Offre liée</label>
              <select
                className="input"
                value={newOfferId}
                onChange={(e) => setNewOfferId(e.target.value)}
              >
                <option value="">— Sélectionner une offre —</option>
                {offers?.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title} ({o.company})
                  </option>
                ))}
              </select>
            </div>
            <div className="offer-form__actions">
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
              <Button
                variant="ai"
                onClick={handleCreate}
                loading={create.isPending}
                disabled={!newOfferId}
              >
                Ajouter la candidature
              </Button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div style={{ display: "grid", placeItems: "center", padding: 60 }}>
          <Spinner dark />
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            gap: 16,
            overflowX: "auto",
            paddingBottom: 20,
            paddingTop: 4,
            scrollbarWidth: "thin",
          }}
        >
          {COLUMNS.map((col) => {
            const columnApps = apps?.filter((a) => a.status === col.id) || [];
            return (
              <div
                key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, col.id)}
                style={{
                  minWidth: 290,
                  flexShrink: 0,
                  background: col.color,
                  borderRadius: 14,
                  padding: 14,
                  border: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  minHeight: 200,
                  transition: "background 0.2s ease",
                }}
              >
                {/* Titre colonne */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: 8,
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--text-muted)",
                    }}
                  >
                    {col.label}
                  </span>
                  <span
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 999,
                      color: "var(--text-muted)",
                    }}
                  >
                    {columnApps.length}
                  </span>
                </div>

                {/* Cartes */}
                {columnApps.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 12,
                      color: "var(--text-light)",
                      padding: 20,
                      fontStyle: "italic",
                    }}
                  >
                    Aucune candidature
                  </div>
                )}

                {columnApps.map((app) => (
                  <div
                    key={app.id}
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData("appId", String(app.id))
                    }
                    onMouseEnter={() => setHoveredId(app.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      background: "var(--surface)",
                      padding: 14,
                      borderRadius: 10,
                      border: "1px solid var(--border)",
                      borderLeft: `4px solid ${
                        app.status === "offer_received"
                          ? "var(--success)"
                          : app.status === "rejected"
                            ? "var(--danger)"
                            : app.status === "interview_scheduled" ||
                                app.status === "interview_done"
                              ? "var(--warning)"
                              : "var(--border-strong)"
                      }`,
                      cursor: "grab",
                      boxShadow:
                        hoveredId === app.id
                          ? "var(--shadow-md)"
                          : "var(--shadow-sm)",
                      transform:
                        hoveredId === app.id ? "translateY(-2px)" : "none",
                      transition: "all 0.15s ease",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <GripVertical
                        size={14}
                        style={{
                          color: "var(--text-light)",
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 13,
                            lineHeight: 1.3,
                            marginBottom: 4,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {app.jobOffer?.title || "Poste non lié"}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--text-muted)",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Building2 size={12} /> {app.jobOffer?.company || "—"}
                        </div>
                        {app.appliedAt && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--text-light)",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              marginTop: 4,
                            }}
                          >
                            <Calendar size={11} />{" "}
                            {new Date(app.appliedAt).toLocaleDateString(
                              "fr-FR",
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {hoveredId === app.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setToDelete(app.id);
                        }}
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          background: "var(--danger-soft)",
                          border: "none",
                          color: "var(--danger)",
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          cursor: "pointer",
                          display: "grid",
                          placeItems: "center",
                          transition: "all 0.15s ease",
                        }}
                        title="Supprimer"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Supprimer cette candidature ?"
        message="Cette action est irréversible."
        onConfirm={() => {
          if (toDelete)
            del.mutate(toDelete, { onSuccess: () => setToDelete(null) });
        }}
        onClose={() => setToDelete(null)}
      />
    </>
  );
};
