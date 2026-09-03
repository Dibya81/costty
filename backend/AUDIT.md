# Backend Audit Report

**Scope note (read first):** The audit brief describes a much larger
platform than currently exists — authentication/JWT, file sharing with
tokens, a community request/offer system, an admin panel, and document
intelligence (page-count/type extraction). **None of these modules have
been built yet.** Only two modules exist: **Print Cost Estimation**
(Phase 1) and **File Management** (Phase 2). Per the brief's own rule
("do not invent endpoints if they do not exist"), this audit does not
fabricate auth/sharing/community/admin endpoints or their tests. Instead,
it audits, tests, and hardens what's actually implemented, and lists the
missing modules explicitly under Known Limitations so the gap is visible
rather than papered over.

---

## What Was Already Working

- Layered architecture (routes → schemas → services → repositories →
  database/storage) was already clean and consistently applied across
  both modules.
- `Decimal`-safe monetary calculations in the pricing engine — verified
  correct for all duplex/odd-page-count cases.
- Alembic migrations were already in place and correctly generated
  (no `create_all()` usage).
- Environment-based configuration with no hardcoded secrets or database
  credentials.
- File ownership scoping, folder nesting, upload validation (extension
  allowlist, size limit), and storage abstraction were already sound in
  design.
- 83 existing tests were all passing before this audit began.

## Fixed Issues

1. **CORS: insecure wildcard default.** `CORS_ORIGINS` defaulted to `*`
   while `allow_credentials=True` is set — this doesn't disable CORS
   protection, it causes the browser-visible `Access-Control-Allow-Origin`
   to echo back *any* requesting origin, granting credentialed access to
   any website. Changed the default to explicit local dev origins
   (`http://localhost:3000,http://localhost:5173`) and added a startup
   warning if `*` is still configured.
2. **Unsanitized `X-User-Id` used directly in storage file paths.** The
   storage key was built as `f"{owner_id}/{uuid}.{ext}"` with no
   sanitization of `owner_id`. Database-level ownership checks already
   prevented cross-user data access, but a crafted header could still
   influence the on-disk directory layout. Added sanitization that strips
   path separators and `..` sequences before the value is used in a
   storage key. Verified live with `X-User-Id: ../../etc` — the file
   lands safely inside `storage/____etc/`, never escaping the storage
   root.
3. **Non-constant-time admin key comparison.** The admin pricing endpoint
   compared the `X-Admin-API-Key` header with Python's `!=`, which
   short-circuits on the first differing byte — a timing side-channel.
   Replaced with `hmac.compare_digest`.
4. **SQLite foreign keys were not enforced**, unlike PostgreSQL, where
   they always are. This meant `ON DELETE SET NULL` / `ON DELETE CASCADE`
   behavior differed silently between dev and prod. Enabled
   `PRAGMA foreign_keys=ON` per SQLite connection so behavior matches
   PostgreSQL.
5. **No cleanup of orphaned storage blobs on DB failure.** Upload already
   wrote to storage before committing the database row (the safe
   ordering), but if the DB commit failed, the blob was left orphaned.
   Added a rollback that deletes the just-written blob if metadata
   persistence fails.
6. **CRLF / control-character injection into response headers.**
   Uploaded/renamed filenames were stored and later placed directly into
   the `Content-Disposition` download header with no sanitization. Added
   filename sanitization at both upload and rename time, and a second
   defensive strip immediately before the header is built.
7. **Stale OpenAPI title/description.** The API metadata still described
   only "Print Cost Estimation Service" even though File Management had
   since been added — inaccurate for a frontend team reading `/docs`.
   Updated title, description, and version to reflect both modules.

All fixes were verified with new regression tests (8 added) and live
`curl` reproduction of each issue before and after the fix.

## Database

- **SQLite (development):** confirmed working from a completely clean
  database — `alembic upgrade head` creates exactly `print_estimates`,
  `pricing_rates`, `folders`, `files` (plus `alembic_version`). No stray
  or missing tables.
- **PostgreSQL (production):** engine/driver resolution verified
  (`postgresql+psycopg://...` resolves correctly); all monetary fields
  use `Numeric(12,2)` and all timestamps use `DateTime(timezone=True)`,
  both of which behave consistently across SQLite and PostgreSQL via
  SQLAlchemy's type layer. Foreign key enforcement now matches between
  environments (see fix #4 above). Switching requires only changing
  `DATABASE_URL` — no code changes.
- **Migrations:** two migrations exist and apply cleanly in sequence from
  an empty database (`4b93572352e9` → `031f17ab4fc0`).

## API

- **Base URL (dev):** `http://127.0.0.1:8000`
- **Version:** `1.1.0`
- **Modules implemented:** Print Cost Estimation, File Management
- **Key endpoints:**
  - `GET /health`
  - `POST/GET /api/v1/estimates`, `GET /api/v1/estimates/{id}`
  - `GET/PUT /api/v1/pricing` (PUT is admin-protected)
  - `POST/GET /api/v1/folders`, `PATCH/DELETE /api/v1/folders/{id}`
  - `POST/GET /api/v1/files`, `GET /api/v1/files/{id}`,
    `GET /api/v1/files/{id}/download`, `PATCH/DELETE /api/v1/files/{id}`
- Verified live: full clean-DB → migrate → estimate → folder → upload →
  download-byte-match → pricing workflow, plus every error path (401,
  404, 400, 422).

## Authentication

**There is no login/JWT system.** File and folder endpoints identify the
caller via a plain `X-User-Id` header (any non-empty string). This is a
deliberate, documented simplification for the File Management module, not
an oversight — but it means **the frontend must not expose this header
to the end user or let it be spoofed**; it is a placeholder for real auth
and should be replaced with a JWT-based dependency (swappable without
touching any route/service/repository, since they only depend on the
resolved user-ID string) before this API is exposed beyond trusted
internal use.

Admin operations (`PUT /api/v1/pricing`) use a separate shared-secret
`X-Admin-API-Key` header, now compared with a constant-time check.

## File Upload — Exact Frontend Request Format

```
POST /api/v1/files
Headers:
  X-User-Id: <user id>
Body: multipart/form-data
  upload: <binary file>
  folder_id: <int, optional>
```

Response `201`:
```json
{
  "id": 1,
  "filename": "report.txt",
  "extension": "txt",
  "content_type": "text/plain",
  "size_bytes": 22,
  "owner_id": "zeni",
  "folder_id": 1,
  "created_at": "...",
  "updated_at": "..."
}
```

## CORS

Development origins now explicitly allowed by default:
```
http://localhost:3000
http://localhost:5173
```
Configurable via `CORS_ORIGINS` (comma-separated). A startup log warning
fires if this is set back to `*`, since `allow_credentials=True` makes a
wildcard here effectively "allow any origin, with credentials" rather
than "open API."

## Testing

- **91 tests passing** (83 pre-existing + 8 new, added specifically to
  cover this audit's fixes): duplicate-filename handling, filename/header
  injection sanitization (upload and rename), path-traversal resistance
  of the storage key, admin-key prefix-bypass resistance, and the CORS
  default itself.
- All tests run against an isolated in-memory SQLite database and an
  isolated temp storage directory — no shared state between tests, no
  pollution of local dev data.

## Postman

`postman/document_platform.postman_collection.json` — organized into a
top-level Print Estimation section plus a "File Management (Phase 2)"
folder. Uses `{{base_url}}`, `{{admin_api_key}}`, `{{user_id}}`,
`{{folder_id}}`, `{{file_id}}` variables (no hardcoded URLs). Includes a
401 case for missing `X-User-Id` and a 400 case for unsupported file
type.

## Frontend Integration — Endpoints Ready Today

```
GET    /health
POST   /api/v1/estimates
GET    /api/v1/estimates
GET    /api/v1/estimates/{id}
GET    /api/v1/pricing
PUT    /api/v1/pricing          (admin only)

POST   /api/v1/folders
GET    /api/v1/folders
GET    /api/v1/folders/{id}
PATCH  /api/v1/folders/{id}
DELETE /api/v1/folders/{id}

POST   /api/v1/files
GET    /api/v1/files
GET    /api/v1/files/{id}
GET    /api/v1/files/{id}/download
PATCH  /api/v1/files/{id}
DELETE /api/v1/files/{id}
```

All of the above are documented with request/response schemas and
examples at `/docs` and `/redoc`.

## Known Limitations (Real, Not Hypothetical)

**Not implemented at all** — these are genuine gaps against the audit
brief, not bugs in existing code:
- No authentication/registration/login/JWT system.
- No file sharing (`/api/v1/shares` — links, permissions, expiration,
  password protection) — does not exist.
- No community module (`/api/v1/community/*` — requests, offers) —
  does not exist.
- No admin panel/dashboard beyond the single pricing-update endpoint —
  no users list, no analytics, no reports, no moderation.
- No document intelligence (page-count extraction, document
  type/category classification, MIME-based analysis beyond what's
  captured at upload) — files are stored with basic metadata only
  (filename, extension, content-type as reported by the client, size);
  nothing inspects file *contents*.
- No notifications, audit logs, or reports tables.

**Implemented but worth knowing:**
- `X-User-Id` is self-declared, not verified — see Authentication above.
- Folder deletion requires empty folders; no recursive/cascade delete.
- No file versioning — each upload is an independent record.
- No rate limiting on any endpoint.
- Large uploads are spooled by Starlette's multipart parser before this
  app's size check runs, so a very large request can consume temp disk
  before being rejected — no ASGI-layer request-size cap is configured.
