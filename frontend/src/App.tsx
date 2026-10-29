import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { NotFound } from "./pages/NotFound";
import { useAuthStore } from "./store/authStore";
import { CVPage } from "./pages/CVPage";
import { JobOffersPage } from "./pages/JobOffersPage";
import { JobAnalysesPage } from "./pages/JobAnalysePage";
import { CVVersionsPage } from "./pages/CVVersionsPage";
import { PresentationsPage } from "./pages/PresentationsPage";
import { InterviewQuestionsPage } from "./pages/InterviewQuestionsPage";
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((s) => s.token);
  if (token) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export const App = () => (
  <BrowserRouter>
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cv" element={<CVPage />} />
        <Route path="/offers" element={<JobOffersPage />} />
        <Route path="/analyses" element={<JobAnalysesPage />} />
        <Route path="/cv-versions" element={<CVVersionsPage />} />
        <Route path="/presentations" element={<PresentationsPage />} />
        <Route
          path="/interview-questions"
          element={<InterviewQuestionsPage />}
        />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
