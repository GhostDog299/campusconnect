import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { MAJORS } from "../components/Shared";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "", major: "", year: "", university: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email.includes("@") || !form.email.endsWith(".edu")) {
      setError("Please enter a valid .edu email address");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await register(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    setLoading(true);
    try { await login("alex@university.edu", "demo123"); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card fade-in">
        <div className="auth-logo">CampusConnect</div>
        <p className="auth-subtitle">
          {mode === "login" ? "Sign in to your university network" : "Join your university's academic network"}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={submit}>
          {mode === "register" && (
            <>
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input className="form-input" type="text" value={form.name} onChange={set("name")} placeholder="Your full name" required />
              </div>
              <div className="form-group">
                <label className="form-label">University</label>
                <input className="form-input" type="text" value={form.university} onChange={set("university")} placeholder="e.g. University of Toronto" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Major</label>
                  <select className="form-select" value={form.major} onChange={set("major")} required>
                    <option value="">Select major</option>
                    {MAJORS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select className="form-select" value={form.year} onChange={set("year")} required>
                    <option value="">Year</option>
                    {[1, 2, 3, 4, 5].map((y) => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">.edu email address</label>
            <input className="form-input" type="text" value={form.email} onChange={set("email")} placeholder="you@university.edu" required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" required minLength={6} />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", padding: "11px", fontSize: 15, marginTop: 8 }}
          >
            {loading ? "..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={demoLogin}
          className="btn btn-secondary"
          style={{ width: "100%", justifyContent: "center", marginTop: 10, fontSize: 13 }}
        >
          Try demo account
        </button>

        <p className="auth-switch">
          {mode === "login" ? "New to CampusConnect? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
            {mode === "login" ? "Create account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
