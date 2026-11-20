import { type FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Lock, Key, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { api, extractError } from "../services/api";
import { Button, Input, Alert } from "../components/ui";

export const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prefilledEmail = location.state?.email || "";

  const [email, setEmail] = useState(prefilledEmail);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/reset-password", {
        email,
        code,
        newPassword: password,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <aside className="auth__visual">
        <div className="auth__brand">
          <span className="auth__brand-dot" />
          AI Career Coach
        </div>
        <div>
          <div className="auth__headline">
            <h1>
              Nouveau <em>départ.</em>
            </h1>
            <p>Entrez le code reçu et choisissez un nouveau mot de passe.</p>
          </div>
        </div>
        <p className="auth__footer-note">
          © {new Date().getFullYear()} AI Career Coach
        </p>
      </aside>

      <section className="auth__panel">
        <div className="auth__card">
          <Link
            to="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 13,
              marginBottom: 16,
              color: "var(--text-muted)",
            }}
          >
            <ArrowLeft size={14} /> Retour à la connexion
          </Link>

          <h2 className="auth__title">Réinitialiser</h2>
          <p className="auth__subtitle">
            Entrez le code à 6 chiffres reçu par email.
          </p>

          {success ? (
            <Alert variant="success">
              <CheckCircle2
                size={16}
                style={{ display: "inline", marginRight: 6 }}
              />
              Mot de passe réinitialisé ! Redirection vers la connexion...
            </Alert>
          ) : (
            <form className="auth__form" onSubmit={onSubmit}>
              {error && <Alert variant="error">{error}</Alert>}
              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="vous@exemple.com"
                icon={<Mail size={16} />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!!prefilledEmail}
              />
              <Input
                id="code"
                label="Code à 6 chiffres"
                type="text"
                placeholder="123456"
                icon={<Key size={16} />}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength={6}
                required
              />
              <Input
                id="password"
                label="Nouveau mot de passe"
                type="password"
                placeholder="••••••••"
                icon={<Lock size={16} />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
              <Input
                id="confirm"
                label="Confirmer le mot de passe"
                type="password"
                placeholder="••••••••"
                icon={<Lock size={16} />}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={8}
                required
              />
              <Button type="submit" loading={loading} full>
                Réinitialiser
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
