export const OUTCOMES = ["COMPLETE", "TERMINATE", "QUOTAFUL", "DISQUALIFY"];
export const ID_PATTERN = "^[A-Za-z0-9][A-Za-z0-9_.:@-]*$";
const base = (import.meta.env?.VITE_API_BASE_URL || "").replace(/\/$/, "");
export class ApiError extends Error {
  constructor(message, status, code, requestId) {
    super(message);
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}
export async function request(
  path,
  { token, body, method = "GET", signal } = {},
) {
  let response;
  try {
    const timeout = AbortSignal.timeout(20000);
    response = await fetch(`${base}${path}`, {
      method,
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError(
      "Unable to reach the server. Please check your connection and try again.",
      0,
    );
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new ApiError(
      data?.error?.message || `Request failed (${response.status}).`,
      response.status,
      data?.error?.code,
      data?.error?.requestId,
    );
  if (!data)
    throw new ApiError(
      "The server returned an unexpected response.",
      response.status,
    );
  return data;
}
export function recordQuery(filters, page = 1, pageSize = 25) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  for (const field of ["recordId", "companyName", "companyCode", "pid", "uid", "status", "country", "from", "to"]) {
    const value = filters[field]?.trim();
    if (value)
      params.set(
        field,
        field === "from" || field === "to"
          ? new Date(value).toISOString()
          : value,
      );
  }
  return params.toString();
}
export function trackingPath(pid, status, params = "") {
  if (!OUTCOMES.includes(status)) throw new Error("Unknown outcome");
  return `/redirect/${encodeURIComponent(pid)}/${status}${params ? `?${params}` : ""}`;
}
export function validatedTrackingPath(pid, status, params, paramMap) {
  const query = new URLSearchParams(params);
  const identifier = value => typeof value === "string" && value.length <= 128 && new RegExp(ID_PATTERN).test(value);
  const fail = message => { throw new ApiError(message, 400, "VALIDATION_ERROR"); };
  if (!identifier(pid)) fail("Invalid project PID. No outcome was submitted.");
  for (const field of ["uid", "transactionId"]) {
    const name = paramMap?.[field];
    if (typeof name !== "string") fail("Tracking configuration is unavailable. No outcome was submitted.");
    const values = query.getAll(name);
    if (values.length !== 1 || !identifier(values[0]))
      fail(`A single valid ${name} is required. No outcome was submitted. Use the original survey callback link or the outcome preview.`);
  }
  if ([...query.keys()].some(name => !Object.values(paramMap).includes(name)))
    fail("Unknown tracking parameters. Company projects must use their permanent company intake link. No outcome was submitted.");
  // Preserve the original encoded query and stable transaction identifier on retries.
  return trackingPath(pid, status, params);
}
export function readSession() {
  try {
    const value = JSON.parse(sessionStorage.getItem("harwinn-session"));
    if (
      typeof value?.token === "string" &&
      /^[A-Za-z0-9_-]{43}$/.test(value.token) &&
      typeof value.admin?.email === "string" &&
      new Date(value.expiresAt).getTime() > Date.now()
    )
      return value;
    sessionStorage.removeItem("harwinn-session");
  } catch {
    /* Storage can be unavailable or malformed. */
  }
  return null;
}
export function saveSession(session) {
  try {
    if (session)
      sessionStorage.setItem("harwinn-session", JSON.stringify(session));
    else sessionStorage.removeItem("harwinn-session");
  } catch {
    /* In-memory authentication remains available. */
  }
}
export function formatDate(value) {
  return value
    ? new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";
}
