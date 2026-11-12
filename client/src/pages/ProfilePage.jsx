import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Avatar, Badge, Btn, MAJORS, avatarColor } from "../components/Shared";

export default function ProfilePage() {
  const { user, apiFetch, updateUser } = useAuth();
  const [stats, setStats] = useState({ connections: 0, posts: 0, resources: 0, reputation: 0 });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: user.bio || "", skills: (user.skills || []).join(", "), major: user.major, year: user.year });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch("/stats").then(setStats);
  }, []);

  const save = async () => {
    setSaving(true);
    const updated = await apiFetch("/users/me", {
      method: "PUT",
      body: JSON.stringify({ ...form, skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean) }),
    });
    updateUser(updated);
    setEditing(false);
    setSaving(false);
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="main-content fade-in">
      <div className="page-header">
        <h2>My Profile</h2>
        <p>How others see you on CampusConnect</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="profile-header">
          <Avatar name={user.name} size="xl" color={avatarColor(user.name)} />
          <div className="profile-info">
            <div className="profile-name">{user.name}</div>
            <div className="profile-title">
              {user.role === "professor" ? "Professor" : `Year ${user.year}`} · {user.major}
              {user.university && <span style={{ color: "var(--ink-3)" }}> · {user.university}</span>}
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              <Badge type="blue">{user.major}</Badge>
              {user.role === "professor" && <Badge type="green">Faculty</Badge>}
              <span className="rep-badge" style={{ fontSize: 13 }}>⬡ {stats.reputation} reputation</span>
            </div>

            {!editing ? (
              <Btn variant="secondary" size="sm" onClick={() => setEditing(true)}>Edit profile</Btn>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="accent" size="sm" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Btn>
                <Btn variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Btn>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 32, borderTop: "1px solid var(--border)", paddingTop: 20, marginTop: 4 }}>
          {[
            { num: stats.connections, label: "Connections" },
            { num: stats.posts, label: "Posts" },
            { num: stats.resources, label: "Resources" },
            { num: stats.reputation, label: "Reputation" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-display)" }}>{s.num}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="section-title">About</p>
        {editing ? (
          <textarea
            className="form-input"
            style={{ width: "100%", padding: "10px 14px", minHeight: 90, resize: "none" }}
            placeholder="Tell your cohort about yourself — interests, projects, what you're looking for…"
            value={form.bio}
            onChange={set("bio")}
          />
        ) : (
          <p style={{ fontSize: 14, color: user.bio ? "var(--ink-2)" : "var(--ink-3)", lineHeight: 1.7 }}>
            {user.bio || "No bio yet. Click 'Edit profile' to add one."}
          </p>
        )}
      </div>

      {/* Skills */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="section-title">Skills</p>
        {editing ? (
          <div>
            <input
              className="form-input"
              style={{ width: "100%", padding: "10px 14px" }}
              placeholder="React, Python, SolidWorks, MATLAB… (comma-separated)"
              value={form.skills}
              onChange={set("skills")}
            />
            <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>Separate skills with commas</p>
          </div>
        ) : (
          <div className="skills-list">
            {(user.skills || []).length === 0 ? (
              <p style={{ fontSize: 14, color: "var(--ink-3)" }}>No skills listed yet.</p>
            ) : (
              (user.skills || []).map((s) => <Badge key={s} type="gray">{s}</Badge>)
            )}
          </div>
        )}
      </div>

      {/* Academic info */}
      {editing && (
        <div className="card fade-in">
          <p className="section-title">Academic info</p>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Major</label>
              <select className="form-select" style={{ width: "100%" }} value={form.major} onChange={set("major")}>
                {MAJORS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <select className="form-select" style={{ width: "100%" }} value={form.year} onChange={set("year")}>
                {[1, 2, 3, 4, 5].map((y) => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* .edu verification badge */}
      <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 8 }}>
        <Badge type="green">✓ .edu verified</Badge>
        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{user.email}</span>
      </div>
    </div>
  );
}
