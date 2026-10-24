import { useEffect, useRef, useState } from "react";
import { request, validatedTrackingPath } from "../lib/api.js";
import logo from "../assets/harwinn-logo-fav.jpeg";
import "./admin.css";
const content = {
  COMPLETE: {
    title: "Thank you for your participation",
    detail:
      "Your survey is complete. Your responses help us deliver better insights.",
    symbol: "✓",
  },
  TERMINATE: {
    title: "Thank you for your time",
    detail:
      "This survey has ended for you. We appreciate your interest and participation.",
    symbol: "—",
  },
  QUOTAFUL: {
    title: "This survey is now full",
    detail:
      "We have received enough responses for this group. Thank you for your interest.",
    symbol: "◷",
  },
  DISQUALIFY: {
    title: "Thank you for your interest",
    detail:
      "You are not eligible to continue with this survey. We appreciate your time.",
    symbol: "◇",
  },
};
export default function Outcome({ pid, status, search = "" }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const pending = useRef(null);
  useEffect(() => {
    document.title = `${content[status].title} | HARWINN INSIGHTS`;
    if (!pid) return;
    let active = true;
    // Share the request across StrictMode's effect replay. Retries keep the original transaction ID.
    pending.current ??= request("/api/tracking/config").then(({ paramMap }) =>
      request(validatedTrackingPath(pid, status, search.replace(/^\?/, ""), paramMap)),
    );
    pending.current.then(
      (data) => {
        if (active) {
          setResult(data);
          setError(null);
        }
      },
      (err) => {
        if (active) setError(err);
      },
    );
    return () => {
      active = false;
    };
  }, [pid, status, search, attempt]);
  const text = content[status];
  return (
    <div className="hi-app hi-center hi-outcome">
      <section className="hi-panel">
        {!pid && <p className="hi-eyebrow">Outcome preview · no response recorded</p>}
        <a href="/">
          <img className="hi-logo" src={logo} alt="HARWINN INSIGHTS" />
        </a>
        <div className={`hi-outcome-icon hi-status-${status}`}>
          {text.symbol}
        </div>
        <span className={`hi-badge hi-status-${status}`}>
          {status === "QUOTAFUL" ? "Quota full" : status.toLowerCase()}
        </span>
        <h1>
          {error
            ? "We could not record your outcome"
            : pid && !result
              ? "Saving your survey outcome…"
              : text.title}
        </h1>
        <p>
          {error
            ? error.message
            : pid && !result
              ? "Please keep this page open while we confirm your response."
              : text.detail}
        </p>
        {pid && result && (
          <p className="hi-muted" role="status">
            {result.duplicate
              ? "Your response was already recorded."
              : "Your response has been recorded."}
          </p>
        )}
        {error && (
          <>
            <p className="hi-muted">
              {error.requestId && `Support reference: ${error.requestId}`}
            </p>
            {(error.status === 0 ||
              error.status >= 500 ||
              error.status === 429) && (
              <button
                onClick={() => {
                  pending.current = null;
                  setError(null);
                  setAttempt((n) => n + 1);
                }}
              >
                Try again
              </button>
            )}
          </>
        )}
        <a className="hi-link" href="/">
          Visit HARWINN INSIGHTS
        </a>
        <p className="hi-muted">
          You may close this window{" "}
          {pid && !result ? "after your outcome is confirmed" : "now"}.
        </p>
      </section>
    </div>
  );
}
