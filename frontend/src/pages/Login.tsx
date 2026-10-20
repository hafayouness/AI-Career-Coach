import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Sparkles,
  FileText,
  MessageSquare,
  Target,
} from "lucide-react";
import { Button, Input, Alert } from "../components/ui";
import { useLogin } from "../hooks/useAuth";
import { extractError } from "../services/api";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
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
            Décrochez le job <em>que vous méritez.</em>
            <p>
              Analysez votre CV, adaptez-le à chaque offre et préparez vos
              entretiens avec une IA exigeante.
            </p>
          </div>

          <div className="auth__features">
            <div className="auth__feature">
              <span className="auth__feature-icon">
                <FileText size={16} />
              </span>
              Analyse de CV instantanée
            </div>
            <div className="auth__feature">
              <span className="auth__feature-icon">
                <Target size={16} />
              </span>
              Matching intelligent avec les offres
            </div>
            <div className="auth__feature">
              <span className="auth__feature-icon">
                <MessageSquare size={16} />
              </span>
              Simulations d'entretien réalistes
            </div>
          </div>
        </div>

        <p className="auth__footer-note">
          © {new Date().getFullYear()} AI Career Coach. Tous droits réservés.
        </p>
      </aside>

      <section className="auth__panel">
        <div className="auth__card">
          <div className="auth__header">
            <h2 className="auth__title">Prêt à décrocher le job ?</h2>
            <p className="auth__subtitle">
              Connectez-vous pour continuer votre préparation.
            </p>
          </div>

          {login.isError && (
            <Alert variant="error">{extractError(login.error)}</Alert>
          )}

          <form className="auth__form" onSubmit={onSubmit}>
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
            <Input
              id="password"
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={16} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="auth__row">
              <label className="auth__checkbox">
                <input type="checkbox" /> Se souvenir de moi
              </label>
              <a href="#" className="auth__link-sm">
                Mot de passe oublié ?
              </a>
            </div>

            <Button type="submit" loading={login.isPending} full>
              <Sparkles size={16} /> Se connecter
            </Button>
          </form>

          <p className="auth__footer">
            Pas encore de compte ? <Link to="/register">Créer un compte</Link>
          </p>
        </div>
      </section>
    </div>
  );
};
