import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

const titles: Record<string, string> = {
  "/dashboard": "Tableau de bord",
  "/cv": "Mon CV",
  "/offers": "Offres d'emploi",
  "/interview": "Préparation entretien",
  "/applications": "Candidatures",
  "/settings": "Paramètres",
};

const getTitle = (pathname: string): string => {
  if (titles[pathname]) return titles[pathname];
  const match = Object.keys(titles).find((k) => pathname.startsWith(k));
  return match ? titles[match] : "AI Career Coach";
};

export const Layout = () => {
  const { pathname } = useLocation();
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        <Topbar title={getTitle(pathname)} />
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
