import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Badge, Btn, MAJORS } from "../components/Shared";

export default function GroupsPage() {
  const { apiFetch, user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", meetingTime: "", location: "", maxSize: 6 });
  const [majorFilter, setMajorFilter] = useState(user.major);

  useEffect(() => {
    const params = majorFilter ? `?major=${encodeURIComponent(majorFilter)}` : "";
    apiFetch(`/studygroups${params}`).then(setGroups).finally(() => setLoading(false));
  }, [majorFilter]);

  const join = async (id) => {
    const { members, isMember } = await apiFetch(`/studygroups/${id}/join`, { method: "POST" });
    setGroups((g) => g.map((gr) => gr.id === id ? { ...gr, memberCount: members, isMember } : gr));
  };

  const create = async (e) => {
    e.preventDefault();
    const g = await apiFetch("/studygroups", { method: "POST", body: JSON.stringify(form) });
    setGroups((gs) => [{ ...g, memberCount: 1, isMember: true }, ...gs]);
    setShowForm(false);
    setForm({ name: "", description: "", meetingTime: "", location: "", maxSize: 6 });
  };

  return (
    <div className="main-content fade-in">
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h2>Study Groups</h2>
          <p>Join a group or start your own for exam prep or project work</p>
        </div>
        <Btn variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Create group"}
        </Btn>
      </div>

      {showForm && (
        <div className="card fade-in" style={{ marginBottom: 24 }}>
          <p className="section-title">New study group</p>
          <form onSubmit={create}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Group name</label>
                <input className="form-input" style={{ width: "100%", padding: "9px 14px" }} placeholder="e.g. OS Midterm Prep" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Max size</label>
                <input className="form-input" style={{ width: "100%", padding: "9px 14px" }} type="number" min={2} max={20} value={form.maxSize} onChange={(e) => setForm((f) => ({ ...f, maxSize: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" style={{ width: "100%", padding: "9px 14px", minHeight: 70, resize: "none" }} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Meeting time</label>
                <input className="form-input" style={{ width: "100%", padding: "9px 14px" }} placeholder="e.g. Sat 2pm weekly" value={form.meetingTime} onChange={(e) => setForm((f) => ({ ...f, meetingTime: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Location / platform</label>
                <input className="form-input" style={{ width: "100%", padding: "9px 14px" }} placeholder="e.g. Library Rm 201 or Discord" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
              </div>
            </div>
            <Btn type="submit" variant="accent">Create group</Btn>
          </form>
        </div>
      )}

      <div className="major-filter">
        <button className={`badge ${majorFilter === "" ? "blue" : "gray"}`} style={{ cursor: "pointer" }} onClick={() => setMajorFilter("")}>All majors</button>
        {MAJORS.map((m) => (
          <button key={m} className={`badge ${majorFilter === m ? "blue" : "gray"}`} style={{ cursor: "pointer" }} onClick={() => setMajorFilter(m)}>{m}</button>
        ))}
      </div>

      {loading ? <p style={{ color: "var(--ink-3)" }}>Loading…</p> : (
        <div className="groups-list">
          {groups.length === 0 && <div className="empty-state"><div className="icon">◈</div><p>No groups yet. Create the first one!</p></div>}
          {groups.map((g) => (
            <div key={g.id} className="card group-card fade-in">
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div className="group-name">{g.name}</div>
                  <Badge type="gray">{g.major}</Badge>
                  {g.isMember && <Badge type="green">Joined</Badge>}
                </div>
                <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 10 }}>{g.description}</p>
                <div className="group-meta" style={{ display: "flex", gap: 16 }}>
                  {g.meetingTime && <span>🕐 {g.meetingTime}</span>}
                  {g.location && <span>📍 {g.location}</span>}
                  <span>👥 {g.memberCount}/{g.maxSize} members</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Btn
                  variant={g.isMember ? "secondary" : "accent"}
                  size="sm"
                  onClick={() => join(g.id)}
                  disabled={g.isMember || g.memberCount >= g.maxSize}
                >
                  {g.isMember ? "Joined" : g.memberCount >= g.maxSize ? "Full" : "Join"}
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
