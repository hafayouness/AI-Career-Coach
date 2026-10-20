import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  MessageSquare,
  Send,
  Settings,
} from "lucide-react";

const links = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/cv", label: "Mon CV", icon: FileText },
  { to: "/offers", label: "Offres", icon: Briefcase },
  { to: "/interview", label: "Entretien", icon: MessageSquare },
  { to: "/applications", label: "Candidatures", icon: Send },
  { to: "/settings", label: "Paramètres", icon: Settings },
];

export const Sidebar = () => (
  <aside className="sidebar">
    <div className="sidebar__brand">
      <span className="sidebar__brand-dot" />
      AI Career Coach
    </div>
    <nav className="sidebar__nav">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <l.icon size={18} />
          {l.label}
        </NavLink>
      ))}
    </nav>
  </aside>
);
