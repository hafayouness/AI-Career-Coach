import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Sparkles,
  FileText,
  Target,
  MessageSquare,
} from "lucide-react";
import { Button, Input, Alert } from "../components/ui";
import { useRegister } from "../hooks/useAuth";
import { extractError } from "../services/api";

export const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [localError, setLocalError] = useState("");
  const register = useRegister();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLocalError("");

    register.mutate({ name, email, password });
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
            <h1>Votre prochaine opportunité commence ici.</h1>
            <p>
              Créez votre compte gratuit et laissez l'IA transformer votre
              recherche d'emploi.
            </p>
          </div>

          <div className="auth__features">
            <div className="auth__feature">
              <span className="auth__feature-icon">
                <FileText size={16} />
              </span>
              CV analysé en quelques secondes
            </div>
            <div className="auth__feature">
              <span className="auth__feature-icon">
                <Target size={16} />
              </span>
              Score de matching par offre
            </div>
            <div className="auth__feature">
              <span className="auth__feature-icon">
                <MessageSquare size={16} />
              </span>
              Simulations d'entretien personnalisées
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
            <h2 className="auth__title">Créer un compte</h2>
            <p className="auth__subtitle">
              Commencez gratuitement en 30 secondes.
            </p>
          </div>

          {(localError || register.isError) && (
            <Alert variant="error">
              {localError || extractError(register.error)}
            </Alert>
          )}

          <form className="auth__form" onSubmit={onSubmit}>
            <Input
              id="name"
              label="Nom complet"
              placeholder="Youness Ahfa"
              icon={<User size={16} />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
              placeholder="Minimum 8 caractères"
              icon={<Lock size={16} />}
              hint="Au moins 8 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />

            <Button type="submit" loading={register.isPending} full>
              <Sparkles size={16} /> Créer mon compte
            </Button>
          </form>

          <p className="auth__footer">
            Déjà inscrit ? <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </section>
    </div>
  );
};
