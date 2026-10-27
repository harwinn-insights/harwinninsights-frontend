import { useEffect, useState } from "react";
import App from "./App.jsx";
import Admin from "./admin/Admin.jsx";
import Outcome from "./admin/Outcome.jsx";
import RecordedOutcome from './admin/RecordedOutcome.jsx';
import { OUTCOMES } from "./lib/api.js";

export default function Router() {
  const [location, setLocation] = useState(
    () => window.location.pathname + window.location.search,
  );
  useEffect(() => {
    const update = () =>
      setLocation(window.location.pathname + window.location.search);
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);
  const path = location.split("?")[0].replace(/\/$/, "") || "/";
  if (path === "/") return <App />;
  if (
    [
      "/admin",
      "/admin/login",
      "/admin/dashboard",
      "/admin/records",
      "/admin/projects",
    ].includes(path) || /^\/admin\/projects\/companies\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(path)
  )
    return <Admin path={path} />;
  const match = /^\/tracking\/([^/]+)\/([^/]+)$/.exec(path);
  if (match && OUTCOMES.includes(match[2])) {
    let pid;
    try {
      pid = decodeURIComponent(match[1]);
    } catch {
      /* Invalid URL encoding. */
    }
    if (pid)
      return (
        <Outcome
          key={location}
          pid={pid}
          status={match[2]}
          search={window.location.search}
        />
      );
  }
  const outcome =
    /^\/(?:tracking\/)?(complete|terminate|quotaful|disqualify)$/i.exec(path);
  if (outcome) return path.startsWith('/tracking/')
    ? <Outcome status={outcome[1].toUpperCase()} />
    : <RecordedOutcome key={location} expectedStatus={outcome[1].toUpperCase()} />;
  return (
    <div className="hi-app hi-center">
      <section className="hi-panel">
        <h1>Page not found</h1>
        <p>The requested page does not exist.</p>
        <a href="/">Return to HARWINN INSIGHTS</a>
      </section>
    </div>
  );
}
