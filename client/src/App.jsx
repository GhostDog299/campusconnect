import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import AuthPage from "./pages/AuthPage";
import FeedPage from "./pages/FeedPage";
import PeoplePage from "./pages/PeoplePage";
import ResourcesPage from "./pages/ResourcesPage";
import GroupsPage from "./pages/GroupsPage";
import ProfilePage from "./pages/ProfilePage";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--paper)" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--ink-3)" }}>Loading…</span>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <div className="app-shell">
      <Sidebar />
      <Routes>
        <Route path="/" element={<Navigate to="/feed" replace />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/people" element={<PeoplePage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
