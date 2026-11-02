import { useState } from "react";
import {
  User as UserIcon,
  Lock,
  Mail,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useUpdateProfile, useChangePassword } from "../hooks/useSettings";
import { useLogout } from "../hooks/useAuth";
import { extractError } from "../services/api";
import { Button, Alert, Input, ConfirmDialog } from "../components/ui";

export const SettingsPage = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [showNameModal, setShowNameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleUpdateName = () => {
    setProfileError("");
    updateProfile.mutate(name, {
      onSuccess: () => setShowNameModal(false),
      onError: (err) => setProfileError(extractError(err)),
    });
  };

  const handleChangePassword = () => {
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas.");
      return;
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setShowPasswordModal(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (err) => setPasswordError(extractError(err)),
      },
    );
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div className="cvversions-page__header">
        <div>
          <h1 className="cvversions-page__title">Paramètres</h1>
          <p className="cvversions-page__subtitle">
            Gérez vos informations et votre sécurité.
          </p>
        </div>
      </div>

      <div
        className="card"
        style={{ marginBottom: 16, padding: 0, overflow: "hidden" }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface-2)",
          }}
        >
          <h2
            style={{
              fontSize: 14,
              fontWeight: 600,
              margin: 0,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Compte
          </h2>
        </div>

        <div
          onClick={() => setShowNameModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <UserIcon size={18} color="var(--primary)" />
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>Nom complet</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {user?.name}
              </div>
            </div>
          </div>
          <ChevronRight size={16} color="var(--text-light)" />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Mail size={18} color="var(--text-light)" />
            <div>
              <div
                style={{
                  fontWeight: 500,
                  fontSize: 14,
                  color: "var(--text-muted)",
                }}
              >
                Adresse email
              </div>
              <div style={{ fontSize: 13, color: "var(--text-light)" }}>
                {user?.email}
              </div>
            </div>
          </div>
          <span className="badge badge--primary" style={{ fontSize: 10 }}>
            Non modifiable
          </span>
        </div>
      </div>

      <div
        className="card"
        style={{ marginBottom: 16, padding: 0, overflow: "hidden" }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface-2)",
          }}
        >
          <h2
            style={{
              fontSize: 14,
              fontWeight: 600,
              margin: 0,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Sécurité
          </h2>
        </div>

        <div
          onClick={() => setShowPasswordModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Lock size={18} color="var(--primary)" />
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>Mot de passe</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Modifier votre mot de passe
              </div>
            </div>
          </div>
          <ChevronRight size={16} color="var(--text-light)" />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          onClick={() => setShowLogoutModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            cursor: "pointer",
            color: "var(--danger)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LogOut size={18} />
            <div style={{ fontWeight: 500, fontSize: 14 }}>Se déconnecter</div>
          </div>
        </div>
      </div>

      {showNameModal && (
        <div
          className="offer-form-overlay"
          onClick={() => setShowNameModal(false)}
        >
          <div
            className="offer-form"
            onClick={(e) => e.stopPropagation()}
            style={{ height: "auto", maxHeight: "90vh" }}
          >
            <div className="offer-form__header">
              <h2 className="offer-form__title">Modifier le nom</h2>
              <button
                className="offer-form__close"
                onClick={() => setShowNameModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            {profileError && <Alert variant="error">{profileError}</Alert>}

            <div className="field">
              <label>Nom complet</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="offer-form__actions">
              <Button variant="ghost" onClick={() => setShowNameModal(false)}>
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateName}
                loading={updateProfile.isPending}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div
          className="offer-form-overlay"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="offer-form"
            onClick={(e) => e.stopPropagation()}
            style={{ height: "auto", maxHeight: "90vh" }}
          >
            <div className="offer-form__header">
              <h2 className="offer-form__title">Changer le mot de passe</h2>
              <button
                className="offer-form__close"
                onClick={() => setShowPasswordModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            {passwordError && <Alert variant="error">{passwordError}</Alert>}

            <Input
              id="currentPassword"
              label="Mot de passe actuel"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              id="newPassword"
              label="Nouveau mot de passe (min. 8 caractères)"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              id="confirmPassword"
              label="Confirmer le nouveau mot de passe"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div className="offer-form__actions">
              <Button
                variant="ghost"
                onClick={() => setShowPasswordModal(false)}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleChangePassword}
                loading={changePassword.isPending}
              >
                Changer
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showLogoutModal}
        title="Se déconnecter ?"
        message="Vous devrez vous reconnecter pour accéder à votre compte."
        confirmLabel="Se déconnecter"
        variant="danger"
        onConfirm={logout}
        onClose={() => setShowLogoutModal(false)}
      />
    </div>
  );
};
