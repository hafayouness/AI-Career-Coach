import { Link } from "react-router-dom";
import { Button } from "../components/ui";

export const NotFound = () => (
  <div className="not-found">
    <div className="not-found__card">
      <h1 className="not-found__title">404</h1>

      <p className="not-found__subtitle">Cette page n'existe pas.</p>

      <Link to="/dashboard">
        <Button>Retour au tableau de bord</Button>
      </Link>
    </div>
  </div>
);
