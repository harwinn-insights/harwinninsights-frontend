import { ErrorMessage } from "./ui.jsx";
import { useCallback, useEffect, useState } from "react";
import { navigate } from "../lib/navigation.js";
import { readSession, saveSession, request } from "../lib/api.js";
import Records from "./Records.jsx";
import Projects from "./Projects.jsx";
import Dashboard from "./Dashboard.jsx";
import logo from "../assets/harwinn-logo-fav.jpeg";
import "./admin.css";
function Login({ onLogin }) {
  const [error, setError] = useState(null),
    [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    try {
      onLogin(
        await request("/api/auth/login", {
          method: "POST",
          body: {
            email: data.get("email").trim(),
            password: data.get("password"),
          },
        }),
      );
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="hi-app hi-center">
      <section className="hi-panel hi-login">
        <a href="/">
          <img className="hi-logo" src={logo} alt="HARWINN INSIGHTS" />
        </a>
        <p className="hi-eyebrow">ADMIN WORKSPACE</p>
        <h1>Welcome back</h1>
        <p className="hi-muted">
          Sign in to manage projects and survey responses.
        </p>
        <ErrorMessage error={error} />
        <form onSubmit={submit}>
          <label>
            Email address
            <input
              name="email"
              type="email"
              autoComplete="username"
              maxLength={254}
              required
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              maxLength={1024}
              required
            />
          </label>
          <button disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        </form>
        <a className="hi-link" href="/">
          Return to public website
        </a>
      </section>
    </div>
  );
}
export default function Admin({ path }) {
  const [session, setSession] = useState(readSession),
    [checked, setChecked] = useState(false),
    [currentUser, setCurrentUser] = useState(null),
    [error, setError] = useState(null),
    [busy, setBusy] = useState(false);
  const expire = useCallback(() => {
    saveSession(null);
    setSession(null);
    setChecked(true);
    navigate("/admin/login");
  }, []);
  const api = useCallback(
    async (url, options = {}) => {
      try {
        return await request(url, { ...options, token: session?.token });
      } catch (err) {
        if (err.status === 401) expire();
        throw err;
      }
    },
    [session, expire],
  );
  useEffect(() => {
    document.title = "Admin workspace | HARWINN INSIGHTS";
    if (!session) return;
    let active = true;
    const controller = new AbortController();

    // eslint-disable-next-line react/set-state-in-effect -- Session state changes only after this asynchronous response.
    api("/api/auth/me", { signal: controller.signal }).then(
      (value) => {
        if (active) {setCurrentUser(value);setChecked(true);}
      },
      (err) => {
        if (active && err.name !== "AbortError") setError(err);
      },
    );
    const timer = setTimeout(
      expire,
      Math.max(0, new Date(session.expiresAt).getTime() - Date.now()),
    );
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [session, api, expire]);
  useEffect(() => {
    if (checked && session && ["/admin", "/admin/login"].includes(path))
      navigate("/admin/dashboard");
  }, [checked, session, path]);
  if (!session)
    return (
      <Login
        onLogin={(value) => {
          setChecked(false);
          setError(null);
          saveSession(value);
          setSession(value);
          navigate("/admin/dashboard");
        }}
      />
    );
  if (!checked)
    return (
      <div className="hi-app hi-center">
        <section className="hi-panel">
          <h1>Admin workspace</h1>
          {error ? (
            <>
              <ErrorMessage error={error} />
              <button
                onClick={() => {
                  setError(null);
                  setChecked(false);
                  setSession({ ...session });
                }}
              >
                Retry connection
              </button>
              <button className="hi-secondary" onClick={expire}>
                Back to sign in
              </button>
            </>
          ) : (
            <p role="status">Checking your session…</p>
          )}
        </section>
      </div>
    );
  const section = path === "/admin/projects" || path.startsWith("/admin/projects/")
    ? "projects"
    : path.endsWith("/records")
      ? "records"
      : "dashboard";
  async function logout() {
    setBusy(true);
    setError(null);
    try {
      await api("/api/auth/logout", { method: "POST" });
      expire();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="hi-app hi-workspace">
      <aside className="hi-sidebar">
        <a href="/">
          <img className="hi-logo" src={logo} alt="HARWINN INSIGHTS" />
        </a>
        <p className="hi-eyebrow">ADMIN WORKSPACE</p>
        <nav aria-label="Admin navigation">
          {["dashboard", "records", "projects"].map((item) => (
            <a
              key={item}
              href={`/admin/${item}`}
              aria-current={section === item ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/admin/${item}`);
              }}
            >
              {item === "dashboard"
                ? "Overview"
                : item === "records"
                  ? "Tracking Records"
                  : "Admin"}
            </a>
          ))}
        </nav>
        <div className="hi-sidebar-bottom">
          <a href="/">Public website ↗</a>
          <span title={session.admin.email}>{session.admin.email}</span>
          <button className="hi-secondary" onClick={logout} disabled={busy}>
            {busy ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>
      <main className="hi-main">
        <header className="hi-topbar">
          <span>HARWINN INSIGHTS / {section === "projects" ? "Admin" : section}</span>
          <span className="hi-live">● Admin session</span>
        </header>
        <ErrorMessage error={error} />
        {section === "dashboard" ? (
          <Dashboard api={api} />
        ) : section === "records" ? (
          <Records api={api} />
        ) : (
          <Projects key={path} api={api} user={currentUser} companyId={/^\/admin\/projects\/companies\/([^/]+)$/.exec(path)?.[1]} />
        )}
      </main>
    </div>
  );
}
