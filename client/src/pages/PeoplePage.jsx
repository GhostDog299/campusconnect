import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Avatar, Badge, Btn, MAJORS, avatarColor } from "../components/Shared";

export default function PeoplePage() {
  const { apiFetch, user } = useAuth();
  const [people, setPeople] = useState([]);
  const [search, setSearch] = useState("");
  const [majorFilter, setMajorFilter] = useState("");
  const [connected, setConnected] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (majorFilter) params.set("major", majorFilter);
    apiFetch(`/users?${params}`).then(setPeople).finally(() => setLoading(false));
  }, [search, majorFilter]);

  const connect = async (id) => {
    await apiFetch(`/users/${id}/connect`, { method: "POST" });
    setConnected((s) => new Set([...s, id]));
  };

  return (
    <div className="main-content fade-in">
      <div className="page-header">
        <h2>People</h2>
        <p>Connect with peers and faculty in your program</p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input
          className="form-input"
          style={{ flex: 1, padding: "9px 14px" }}
          placeholder="Search by name or skill…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          style={{ width: 220 }}
          value={majorFilter}
          onChange={(e) => setMajorFilter(e.target.value)}
        >
          <option value="">All majors</option>
          {MAJORS.map((m) => <option key={m}>{m}</option>)}
        </select>
      </div>

      {loading ? (
        <p style={{ color: "var(--ink-3)" }}>Loading…</p>
      ) : people.length === 0 ? (
        <div className="empty-state"><div className="icon">◎</div><p>No people found</p></div>
      ) : (
        <div className="people-grid">
          {people.map((p) => (
            <div key={p.id} className="card person-card fade-in">
              <Avatar name={p.name} size="lg" color={avatarColor(p.name)} />
              <div className="person-name">{p.name}</div>
              <div className="person-major">
                {p.role === "professor" ? "📚 " : `Year ${p.year} · `}{p.major}
              </div>
              {p.bio && <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 10, lineHeight: 1.5 }}>{p.bio.slice(0, 80)}{p.bio.length > 80 ? "…" : ""}</p>}
              <div className="person-skills">
                {(p.skills || []).slice(0, 3).map((s) => (
                  <Badge key={s} type="gray">{s}</Badge>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <span className="rep-badge">⬡ {p.reputation}</span>
                <Btn
                  variant={connected.has(p.id) ? "secondary" : "primary"}
                  size="sm"
                  onClick={() => connect(p.id)}
                  disabled={connected.has(p.id)}
                >
                  {connected.has(p.id) ? "Connected" : "+ Connect"}
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
