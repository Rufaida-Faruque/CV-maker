import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./components/auth/LoginPage";
import CvWorkspace from "./components/CvWorkspace";
import SetupRequired from "./components/SetupRequired";
import "./styles/app.css";
import "./styles/editor.css";
import "./styles/workspace.css";
import "./styles/login.css";

function AppRoutes() {
  const { user, loading, configured } = useAuth();

  if (!configured) return <SetupRequired />;
  if (loading) return <div className="workspace-loading">Loading…</div>;
  if (!user) return <LoginPage />;
  return <CvWorkspace />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
