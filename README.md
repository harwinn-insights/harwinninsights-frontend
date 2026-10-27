# HARWINN INSIGHTS frontend

The existing public website at `/` remains in `src/App.jsx` and its original components. The separate admin workspace integrates with the existing Express backend at `http://localhost:3000`.

## Run locally

Verified outcome pages now show the saved UID, external PID and recorded status
through a single-use, ten-minute receipt bound to the persisted row. The respondent
network IP is captured separately during verification and displayed only when it
matches this request's validated network address; otherwise it shows Unavailable.
Callback IP and internal identifiers remain private. The new nullable respondentIp
column must be migrated before using the updated backend. See
`../Backend/docs/RESPONDENT_NETWORK_IP.md`. Restart the local backend and retry the
original callback after updating; old or consumed receipts cannot be reused. See
`../Backend/docs/CALLBACK_OUTCOME_REDIRECT.md` for local instructions and the current
single-instance receipt-store limitation (shared atomic storage is required before
serverless/multi-instance rollout).

```powershell
npm.cmd ci
npm.cmd run dev
```

Open the URL Vite prints. Sign in at `/admin/login` using an administrator already provisioned in the backend. There are no default credentials or frontend signup/reset endpoints. The backend must be running and its database ready.

To inspect the production build locally:

```powershell
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1
```

Both dev and preview proxy `/api` and `/redirect` to `http://localhost:3000`, avoiding cross-origin requests. Preview normally serves `http://127.0.0.1:4173`.

## Routes and behavior

- `/`: original public website, sections, navigation, blog section and EmailJS contact form.
- `/admin/login`: email/password login; sessions restored through `GET /api/auth/me` and revoked through `POST /api/auth/logout`.
- `/admin/dashboard` (also `/admin`): live totals for COMPLETE, TERMINATE, QUOTAFUL and DISQUALIFY, and five latest responses.
- `/admin/records`: all record fields, exact PID/UID/status/country filters, inclusive createdAt time filters, server pagination and refresh. Browser-local dates are sent as ISO timestamps. Null metadata displays as an em dash; LOI displays in seconds and preserves zero.
- `/admin/projects`: add Project Names and optional client-supplied unique Project IDs, edit ID/name/active state, delete empty projects, and copy the four callback URLs. Deletion requires an explicit in-page confirmation; records prevent deletion with HTTP 409.
- `/tracking/:pid/:status?uid=...&transactionId=...`: persists the outcome through the corresponding backend `GET /redirect/:pid/:status` and then displays the outcome page. Status must be COMPLETE, TERMINATE, QUOTAFUL or DISQUALIFY. Optional username/inTime and custom externally mapped query names are passed through unchanged to the backend. Do not include unrelated parameters: the backend rejects them. Transaction IDs must remain stable for retries. A conflicting retry shows an error, never a success message.
- `/tracking/complete`, `/tracking/terminate`, `/tracking/quotaful`, `/tracking/disqualify`: safe design previews without persistence. `/complete`, `/terminate`, `/quotaful`, `/disqualify` are aliases.

Company Details generates permanent company callbacks with external projectId={PID} and the configured UID field only. Internal references are backend-managed; UID-only acceptance requires approved database project/UID uniqueness. Existing legacy /tracking URLs still require provider transaction IDs. If REDIRECT_PARAM_MAP is configured differently later, use those agreed parameter names in the links. Backend callbacks preserve JSON responses unless an existing destination applies or the verified browser redirect fallback is enabled.

`/complete`, `/terminate`, `/quotaful`, `/disqualify` require a short-lived backend-signed receipt, verified through POST `/api/tracking/outcome`. They reuse the branded outcome UI and never infer recording from the route alone. Explicit `/tracking/complete` etc. remain previews. Do not configure a plain preview URL as a recorded-result destination. See `../Backend/docs/CALLBACK_OUTCOME_REDIRECT.md` for the backend opt-in, existing destination precedence, provider limitations and rollout. Configure production VITE_API_BASE_URL for the actual backend; the local .env points to localhost. For unit tests use VITE_API_BASE_URL=/ so mocked API paths stay relative.

Authentication uses bearer tokens in sessionStorage, scoped to the browser tab; passwords are never stored. Session expiry and HTTP 401 clear the session. Network failures have a 20-second timeout and retry controls. Backend errors show the sanitized message and support request ID. Overview counts are separate live requests, so simultaneous new records can make totals briefly differ.

## Verification

```powershell
npm.cmd run build
npm.cmd run lint
npm.cmd test
```

The component tests use jsdom and test public-site preservation, login/logout, session expiry, overview totals, record filters/pagination, project CRUD errors, generated URLs, every outcome, StrictMode request replay and stable retry transactions. API client tests cover headers, 204 responses, error handling, date filters and session storage.

The optional contract test imports the actual backend Express app and its fake repository. It creates only isolated in-memory fixtures, without modifying backend files or the running database:

```powershell
$env:HARWINN_BACKEND_PATH = 'D:\Projects\HARWINN'
npm.cmd test
```

Without that variable, the single backend-contract test skips. The backend's own available tests can be run with `npm.cmd --prefix D:\Projects\HARWINN test`. Its PostgreSQL test independently requires TEST_DATABASE_URL; the frontend test does not supply database credentials.

With the production preview and backend already running, `node test/smoke.mjs` checks live routes, assets, authentication protection and callback validation without writing records. FRONTEND_URL and BACKEND_URL may override its local defaults. Run it after the build finishes, since rebuilding replaces dist.

Verified on 2026-10-10: production build passed (71 transformed modules); lint passed with zero warnings/errors; 27 frontend tests passed including the optional actual-backend contract test; 13 live smoke checks passed; backend tests had 21 passes, zero failures and one PostgreSQL test skipped because TEST_DATABASE_URL was absent; npm audit reported zero vulnerabilities. Component flows were verified with jsdom. Visual browser verification was unavailable because no browser was connected. No backend files were modified and no live database fixtures were created.

## Production hosting

`dist` is a static build. Host it behind a same-origin reverse proxy: serve index.html for frontend routes and proxy `/api/` and `/redirect/` to the backend. `deploy/nginx.conf.example` illustrates the required routing. Vite's development/preview proxies are not embedded in dist. Use HTTPS and adapt paths/domain to the hosting environment.

VITE_API_BASE_URL is an optional build-time override; leave it empty for the default same-origin proxy. Pointing it directly to a different origin requires explicit backend CORS configuration, which this implementation does not change. Vite environment variables are public bundle configuration and must not contain secrets.

The backend derives IP from its network peer and leaves country null unless a server-owned resolver is configured. Behind a proxy it will record the proxy peer unless TRUST_PROXY is deliberately configured for that proxy. No backend trust or redirect settings were modified.

The original public contact form still contains its pre-existing EmailJS placeholders (YOUR_SERVICE_ID, YOUR_TEMPLATE_ID, YOUR_PUBLIC_KEY). Supply the account's actual values separately to deliver emails; this implementation preserves the original form and behavior.

Project workflow: share the agreed platform/tool link, then add the Project ID and Project Name supplied by the client in Projects. Projects may omit IDs, including multiple projects from the same company; supplied IDs must be unique and names are not unique. Editing the client Project ID retains the internal UUID and tracking history. Re-share outcome links after changing the ID because old links no longer accept callbacks. Duplicate IDs on Add/Edit return HTTP 409 and leave the form values available for correction. No schema migration or client installation feature is introduced.

Project ID is optional on Add/Edit. Blank input is sent as null; no ID is generated. Saving waits for the authenticated backend request, prevents repeat submissions and reloads the list from the backend. Projects without IDs remain visible/editable and do not expose tracking URLs. Apply the backend optional-PID migration before using blank IDs.
