import { useEffect, useState } from "react";
import { OUTCOMES, ID_PATTERN, recordQuery, formatDate } from "../lib/api.js";
import { ErrorMessage, Pager } from "./ui.jsx";
export function RecordTable({ records }) {
  return (
    <div className="hi-table-wrap">
      <table>
        <thead>
          <tr>
            {[
              "Record ID",
              "Company",
              "Project UUID",
              "PID",
              "UID",
              "Username",
              "Status",
              "In time",
              "Out time",
              "LOI (seconds)",
              "IP address",
              "Country",
              "Transaction ID",
              "Created",
            ].map((title) => (
              <th key={title}>{title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((row) => (
            <tr key={row.serial}>
              <td>{row.serial}</td>
              <td>{row.project?.company ? `${row.project.company.code} — ${row.project.company.name}` : "—"}</td>
              <td>{row.projectId || row.project?.id || "—"}</td>
              <td>{row.project?.pid || "—"}</td>
              <td>{row.uid}</td>
              <td>{row.username || "—"}</td>
              <td>
                <span className={`hi-badge hi-status-${row.status}`}>
                  {row.status}
                </span>
              </td>
              <td>{formatDate(row.inTime)}</td>
              <td>{formatDate(row.outTime)}</td>
              <td>{row.loiSeconds ?? "—"}</td>
              <td>{row.ipAddress || "—"}</td>
              <td>{row.country || "—"}</td>
              <td>{row.transactionId}</td>
              <td>{formatDate(row.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
const empty = { recordId: "", companyName: "", companyCode: "", pid: "", uid: "", status: "", country: "", from: "", to: "" };
export default function Records({ api }) {
  const [draft, setDraft] = useState(empty),
    [filters, setFilters] = useState(empty),
    [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState(25),
    [data, setData] = useState(null),
    [error, setError] = useState(null),
    [busy, setBusy] = useState(true),
    [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react/set-state-in-effect -- Each external request must clear its prior loading/error state.
    setBusy(true);
    setError(null);
    api(`/api/records?${recordQuery(filters, page, pageSize)}`, {
      signal: controller.signal,
    }).then(
      (value) => {
        setData(value);
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
  }, [api, filters, page, pageSize, refresh]);
  function apply(e) {
    e.preventDefault();
    if (draft.from && draft.to && new Date(draft.from) > new Date(draft.to)) {
      setError(new Error("Start time must precede end time."));
      return;
    }
    setPage(1);
    setFilters({ ...draft });
  }
  const field = (name, label, props = {}) => (
    <label>
      {label}
      <input
        value={draft[name]}
        onChange={(e) => setDraft({ ...draft, [name]: e.target.value })}
        {...props}
      />
    </label>
  );
  return (
    <>
      <div className="hi-page-heading">
        <div>
          <p className="hi-eyebrow">SURVEY OPERATIONS</p>
          <h1>Tracking records</h1>
          <p>Review respondent outcomes and server-recorded timing.</p>
        </div>
        <button
          className="hi-secondary"
          disabled={busy}
          onClick={() => setRefresh((n) => n + 1)}
        >
          Refresh
        </button>
      </div>
      <section className="hi-panel">
        <form className="hi-filters" onSubmit={apply}>
          {field("recordId", "Record ID", { pattern: "[1-9][0-9]{0,18}", maxLength: 19, inputMode: "numeric" })}
          {field("companyName", "Company Name", { maxLength: 200 })}
          {field("companyCode", "Company ID", { pattern: ID_PATTERN, maxLength: 128 })}
          {field("pid", "Project PID", { pattern: ID_PATTERN, maxLength: 128 })}
          {field("uid", "Respondent UID", {
            pattern: ID_PATTERN,
            maxLength: 128,
          })}
          <label>
            Status
            <select
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value })}
            >
              <option value="">All outcomes</option>
              {OUTCOMES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          {field("country", "Country (two uppercase letters)", {
            pattern: "[A-Z]{2}",
            maxLength: 2,
            placeholder: "IN",
          })}
          {field("from", "Created from (local time)", {
            type: "datetime-local",
            step: "1",
          })}
          {field("to", "Created to (local time)", {
            type: "datetime-local",
            step: "1",
          })}
          <div className="hi-actions">
            <button disabled={busy}>Apply filters</button>
            <button
              className="hi-secondary"
              type="button"
              onClick={() => {
                setDraft(empty);
                setFilters({ ...empty });
                setPage(1);
              }}
              disabled={busy}
            >
              Reset
            </button>
          </div>
        </form>
        <p className="hi-muted">
          Record ID, Company ID (company code), PID and UID use exact matches. Company Name matches part of the name, ignoring case. Date filters include both endpoints;
          displayed times use your browser’s timezone.
        </p>
      </section>
      <section className="hi-panel hi-data-panel" aria-busy={busy}>
        <ErrorMessage error={error} />
        {busy ? (
          <p role="status">Loading records…</p>
        ) : (
          !error &&
          data && (
            <>
              {data.records.length ? (
                <RecordTable records={data.records} />
              ) : (
                <div className="hi-empty">
                  <h2>No records found</h2>
                  <p>
                    Try adjusting the filters, or wait for a survey response.
                  </p>
                </div>
              )}
              <Pager
                page={page}
                pageSize={pageSize}
                count={data.records.length}
                total={data.total}
                onPage={setPage}
                onSize={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
              />
            </>
          )
        )}
        {error && (
          <button
            className="hi-secondary"
            onClick={() => setRefresh((n) => n + 1)}
          >
            Retry
          </button>
        )}
      </section>
    </>
  );
}
