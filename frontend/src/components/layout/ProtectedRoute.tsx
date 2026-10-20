import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useMe } from "../../hooks/useAuth";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((s) => s.token);
  const { isLoading } = useMe();

  if (!token) return <Navigate to="/login" replace />;

  if (isLoading) {
    return (
      <div className="auth">
        <div className="auth__card" style={{ textAlign: "center" }}>
          Chargement…
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
