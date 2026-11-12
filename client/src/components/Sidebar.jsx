import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Avatar, avatarColor } from "./Shared";

const navItems = [
  { icon: "⊞", label: "Feed", path: "/feed" },
  { icon: "◎", label: "People", path: "/people" },
  { icon: "⬡", label: "Resources", path: "/resources" },
  { icon: "◈", label: "Study Groups", path: "/groups" },
  { icon: "◻", label: "My Profile", path: "/profile" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>CampusConnect</h1>
        <span>{user?.university || "University Network"}</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user" onClick={() => navigate("/profile")}>
          <Avatar name={user?.name} size="sm" color={avatarColor(user?.name)} />
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-major">{user?.major}</div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{ width: "100%", marginTop: 8, padding: "6px 8px", color: "rgba(255,255,255,0.35)", fontSize: 13, textAlign: "left", background: "none", border: "none", cursor: "pointer", borderRadius: 8 }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
