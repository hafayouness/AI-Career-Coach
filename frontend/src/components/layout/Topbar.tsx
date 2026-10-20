import { LogOut } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useLogout } from "../../hooks/useAuth";

export const Topbar = ({ title }: { title: string }) => {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <header className="topbar">
      <div className="topbar__title">{title}</div>
      <div className="topbar__user">
        <div className="avatar">{user?.name?.[0]?.toUpperCase() ?? "?"}</div>
        <span>{user?.name}</span>
        <button
          className="btn btn--ghost"
          onClick={logout}
          aria-label="Déconnexion"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};
