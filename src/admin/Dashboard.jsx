import { useEffect, useState } from "react";
import { OUTCOMES } from "../lib/api.js";
import { ErrorMessage } from "./ui.jsx";
import { RecordTable } from "./Records.jsx";
import { navigate } from "../lib/navigation.js";
export default function Dashboard({ api }) {
  const [data, setData] = useState(null),
    [error, setError] = useState(null),
    [busy, setBusy] = useState(true),
    [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react/set-state-in-effect -- Each external request must clear its prior loading/error state.
    setBusy(true);
    setError(null);
    Promise.all([
      api("/api/records?page=1&pageSize=5", { signal: controller.signal }),
      ...OUTCOMES.map((status) =>
        api(`/api/records?page=1&pageSize=1&status=${status}`, {
          signal: controller.signal,
        }),
      ),
    ]).then(
      ([recent, ...counts]) => {
        setData({ recent, counts });
        setBusy(false);
      },
      (err) => {
        if (err.name !== "AbortError") {
          setError(err);
          setBusy(false);
        }
      },
    );
    return () => controller.abort();
  }, [api, refresh]);
  return (
    <>
      <div className="hi-page-heading">
        <div>
          <p className="hi-eyebrow">RESEARCH AT A GLANCE</p>
          <h1>Overview</h1>
          <p>A live view of survey outcomes across your projects.</p>
        </div>
        <button
          className="hi-secondary"
          disabled={busy}
          onClick={() => setRefresh((n) => n + 1)}
        >
          Refresh
        </button>
      </div>
      <ErrorMessage error={error} />
      {busy ? (
        <p role="status">Loading overview…</p>
      ) : (
        data &&
        !error && (
          <>
            <section className="hi-stats">
              {OUTCOMES.map((status, i) => (
                <article className="hi-panel" key={status}>
                  <span className={`hi-badge hi-status-${status}`}>
                    {status}
                  </span>
                  <strong>{data.counts[i].total.toLocaleString()}</strong>
                  <span className="hi-muted">Recorded responses</span>
                </article>
              ))}
            </section>
            <section className="hi-panel">
              <div className="hi-page-heading">
                <div>
                  <h2>Latest responses</h2>
                  <p>{data.recent.total.toLocaleString()} total records</p>
                </div>
                <a
                  href="/admin/records"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/admin/records");
                  }}
                >
                  View all records →
                </a>
              </div>
              {data.recent.records.length ? (
                <RecordTable records={data.recent.records} />
              ) : (
                <div className="hi-empty">
                  <h2>Ready for your first response</h2>
                  <p>
                    Register a project under its company and configure that
                    company’s permanent callbacks with the survey provider.
                  </p>
                  <a
                    href="/admin/projects"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/admin/projects");
                    }}
                  >
                    Manage companies →
                  </a>
                </div>
              )}
            </section>
          </>
        )
      )}
      {error && <button onClick={() => setRefresh((n) => n + 1)}>Retry</button>}
      <section className="hi-panel hi-note">
        <h2>Survey workflow</h2>
        <p>
          Configure each company’s four callbacks once, then register each
          project’s external PID under that company. Respondents use the provider’s
          survey URL directly. Out time, IP address and length
          of interview are recorded by the backend; country may be unavailable.
        </p>
      </section>
    </>
  );
}
