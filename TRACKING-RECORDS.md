# Tracking Records field sources and IP accuracy

The records table places Record ID, UID, PID (external), Status / Outcome and IP first, followed by the existing company, internal project UUID, username, timing, country, transaction and creation fields. Long identifiers and IPv6 addresses wrap; the table scrolls horizontally within its panel and the scroll region is keyboard focusable. The shared table also appears in Overview's latest responses. Existing search, pagination, loading/error handling and authorization paths are unchanged.

## Existing data contract

| Display | Existing source | Meaning |
| --- | --- | --- |
| Record ID | `TrackingRecord.serial` | BigInt serialized as a string by the API. |
| UID | `TrackingRecord.uid` → `row.uid` | Accepted mapped respondent identifier. |
| PID (external) | `Project.pid` → `row.project.pid` | Current provider/external project ID from the related project. Never substituted with `projectId` or `project.id`. |
| Status / Outcome | `TrackingRecord.status` → `row.status` | Persisted COMPLETE, TERMINATE, QUOTAFUL or DISQUALIFY. |
| IP | `TrackingRecord.ipAddress` → `row.ipAddress` | Persisted callback request/source IP, nullable for historical data. |
| Company | `row.project.company.code` and `.name` | Company ID and name returned through the project relation. |
| Project UUID | `row.projectId` or `row.project.id` | Internal project identity, separately labeled. |

`GET /api/records` calls `listRecords` in `Backend/src/services/tracking.js`, which returns the tracking fields and selects the related project's `pid`, `id` and public company fields. `serializeRecord` in `Backend/src/lib/validation.js` converts the serial to a string without changing these fields. The existing Prisma model already supports all requested columns, so no API or schema change is required. Missing values display an em dash; the UI does not infer identities or IPs.

External PID is read from the current project relation, not an immutable callback-time snapshot. Editing a project's PID changes what historical rows display. This task preserves that existing contract. If an immutable historical PID is later required, it needs a separately approved persistence design; the UI cannot reconstruct it reliably.

## IP extraction and limits

1. `Backend/src/app.js` configures Express `trust proxy` with `config.trustedProxies`, or `false` when the list is empty.
2. `Backend/src/config.js` parses `TRUST_PROXY` as explicit IPs/CIDRs, validates it and defaults to an empty list. The checked local effective setting was unset/empty. Deployment settings and network topology were not verified.
3. `Backend/src/controllers/tracking.js` passes `req.ip` to `recordOutcome` as `ip`. It does not accept respondent IP from a callback query/body. Its strict allowlist permits only configured UID/transaction/username/in-time fields and, on company paths, external `projectId`.
4. With proxy trust disabled, `req.ip` comes from the socket peer and `X-Forwarded-For` is ignored. With explicitly trusted proxies, Express resolves `req.ip` from the peer/forwarded chain according to that trust list. Other caller-supplied IP headers are not mapped into the persisted field by application code. Correct forwarding still depends on the proxy overwriting untrusted values and a correctly scoped deployment trust configuration.
5. `Backend/src/services/tracking.js` validates new IPs with Node's `isIP`, then stores `ipAddress: ip` in PostgreSQL INET. Identical retries return the existing record without updating its original IP. The listing endpoint returns that persisted value, not the admin browser's current IP.

**The stored IP is not verified as the actual respondent IP.** A browser callback may originate from a respondent, but a server-to-server provider callback records the provider source; a proxy with trust disabled may appear as the peer. NAT and VPNs can also affect the address. No provider identity contract or live network evidence was established here. Therefore the UI calls it the callback source and does not label it as verified respondent location/identity.

No IP extraction, headers, proxy configuration, callback logic, schema, migration, authorization or production data was changed. No additional respondent fields or secrets are requested or exposed.

## Verification

Frontend tests use mocked fetch or a real Express app backed by synthetic in-memory repositories, never the configured Supabase database. Tests are run with process-only `VITE_API_BASE_URL=/` (normalizes to an empty client base), matching their relative-path contract, and `HARWINN_BACKEND_PATH` set to this checkout's Backend folder. Environment files remain unchanged. The existing table regression test checks all four outcomes, external PID versus UUID, missing PID/project/IP, IPv4/IPv6, zero LOI and retained columns. Existing search and authorization-scope tests remain in the suite.

Results on 25 October 2026: all 64 tests passed across nine files; `npm.cmd run lint` passed; `npm.cmd run build` passed (73 transformed modules); `git diff --check` passed. Compiled CSS includes the wrapping, minimum table width and focus styles. The first verification run found a test-file encoding issue (an em dash became `?` while passing text through Windows PowerShell); explicit Unicode escapes corrected the assertion, and the full suite then passed. This was not an application defect.

Desktop/mobile browser visual verification was not performed because browser control previously stopped when it could not reliably verify the current URL. Responsive behavior is implemented with the existing bounded scroll container and Tailwind wrapping/width utilities; real-device visual acceptance remains unverified. No live database verification, production writes or deployment was performed.
