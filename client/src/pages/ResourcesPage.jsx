import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Badge, Btn, MAJORS, avatarColor, Avatar } from "../components/Shared";

const TYPE_LABELS = { notes: "Notes", practice: "Practice exam", guide: "Guide", other: "Other" };
const TYPE_COLORS = { notes: "blue", practice: "green", guide: "amber", other: "gray" };

export default function ResourcesPage() {
  const { apiFetch, user } = useAuth();
  const [resources, setResources] = useState([]);
  const [majorFilter, setMajorFilter] = useState(user.major);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", type: "notes" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = majorFilter ? `?major=${encodeURIComponent(majorFilter)}` : "";
    apiFetch(`/resources${params}`).then(setResources).finally(() => setLoading(false));
  }, [majorFilter]);

  const download = async (id) => {
    const { downloads } = await apiFetch(`/resources/${id}/download`, { method: "POST" });
    setResources((r) => r.map((res) => (res.id === id ? { ...res, downloads } : res)));
  };

  const upload = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await apiFetch("/resources", { method: "POST", body: JSON.stringify(form) });
    setResources((r) => [res, ...r]);
    setForm({ title: "", description: "", type: "notes" });
    setShowForm(false);
    setSubmitting(false);
  };

  return (
    <div className="main-content fade-in">
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h2>Resources</h2>
          <p>Notes, practice exams, and guides from your peers</p>
        </div>
        <Btn variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Upload resource"}
        </Btn>
      </div>

      {showForm && (
        <div className="card fade-in" style={{ marginBottom: 24 }}>
          <p className="section-title">Share a resource</p>
          <form onSubmit={upload}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" style={{ width: "100%", padding: "9px 14px" }} placeholder="e.g. Midterm formula sheet" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" style={{ width: "100%", padding: "9px 14px", minHeight: 80, resize: "none" }} placeholder="What's in this resource? Who is it useful for?" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" style={{ width: 200 }} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 12 }}>Note: In production, attach a real file. This demo tracks metadata only.</p>
            <Btn type="submit" variant="accent" disabled={submitting}>{submitting ? "Uploading…" : "Share resource"}</Btn>
          </form>
        </div>
      )}

      {/* Major filter */}
      <div className="major-filter">
        <button className={`badge ${majorFilter === "" ? "blue" : "gray"}`} style={{ cursor: "pointer" }} onClick={() => setMajorFilter("")}>All</button>
        {MAJORS.map((m) => (
          <button key={m} className={`badge ${majorFilter === m ? "blue" : "gray"}`} style={{ cursor: "pointer" }} onClick={() => setMajorFilter(m)}>{m}</button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "var(--ink-3)" }}>Loading…</p>
      ) : resources.length === 0 ? (
        <div className="empty-state"><div className="icon">⬡</div><p>No resources yet. Be the first to share!</p></div>
      ) : (
        <div className="resource-grid">
          {resources.map((r) => (
            <div key={r.id} className="card resource-card fade-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <Badge type={TYPE_COLORS[r.type] || "gray"}>{TYPE_LABELS[r.type] || r.type}</Badge>
                {r.endorsedBy?.length > 0 && <Badge type="green">✓ Endorsed</Badge>}
              </div>
              <div className="resource-title">{r.title}</div>
              <p className="resource-desc">{r.description}</p>
              <div className="resource-footer">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar name={r.uploader?.name} size="sm" color={avatarColor(r.uploader?.name)} />
                  <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{r.uploader?.name}</span>
                </div>
                <Btn variant="secondary" size="sm" onClick={() => download(r.id)}>
                  ↓ {r.downloads}
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
