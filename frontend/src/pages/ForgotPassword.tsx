import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { api, extractError } from "../services/api";
import { Button, Input, Alert } from "../components/ui";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess(true);

      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 2000);
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
              Récupérez votre <em>accès.</em>
            </h1>
            <p>Un code à 6 chiffres vous sera envoyé par email.</p>
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

          <h2 className="auth__title">Mot de passe oublié</h2>
          <p className="auth__subtitle">
            {success
              ? "Vérifiez votre boîte mail."
              : "Entrez votre email pour recevoir un code."}
          </p>

          {success ? (
            <Alert variant="success">
              <CheckCircle2
                size={16}
                style={{ display: "inline", marginRight: 6 }}
              />
              Code envoyé ! Vérifiez votre email. Redirection...
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
              />
              <Button type="submit" loading={loading} full>
                Envoyer le code
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
