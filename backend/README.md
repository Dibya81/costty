# Document Platform API — Print Cost Estimation + File Management

A production-ready REST API backend built with **FastAPI**, **SQLAlchemy**,
and **Alembic**, using **SQLite** for local development with a
straightforward path to **PostgreSQL** in production.

This backend currently implements two modules:

1. **Print Cost Estimation** — calculate and persist structured print cost
   breakdowns from page count, copies, color mode, and print type, with
   fully configurable pricing.
2. **File Management** — upload, download, rename, move, delete, organize
   into folders, and search a personal document library, backed by a
   storage abstraction that runs on the local filesystem in development
   and can be swapped for S3-compatible cloud storage without touching
   application code.

Both modules follow the same strict layered architecture:

```
Routes → Schemas → Services → Repositories → Database / Storage
```

---

## 1. Project Overview

### Print Cost Estimation

Users submit print requirements (page count, number of copies, color mode,
simplex/duplex) to `POST /api/v1/estimates`. The service determines the
applicable price per printed side from a **configurable pricing table**,
calculates printed sides, physical sheets (correctly handling duplex
printing and odd page counts), cost per copy, and total cost, and returns
a full breakdown. All monetary values use `Decimal` — never floating
point.

### File Management

Users (identified via a simple `X-User-Id` header — see
[Authentication](#4-authentication-x-user-id-header) below) can upload
files into a personal library, organize them into nested folders, rename
and move both files and folders, search/filter by name or extension, and
download files back out. Every file and folder is scoped to its owner —
one user can never see or modify another user's documents.

---

## 2. Tech Stack

```
Python 3.12
FastAPI
SQLAlchemy 2.x
Pydantic v2 / Pydantic Settings
Alembic
SQLite (development) / PostgreSQL (production)
Local filesystem storage (development) / S3-compatible storage (production-ready abstraction)
Pytest
Postman
```

---

## 3. Project Structure

```
backend/
│
├── app/
│   ├── main.py                    # FastAPI app entrypoint
│   │
│   ├── api/
│   │   ├── deps.py                # Shared dependencies (DB session, current user, storage, admin auth, pagination)
│   │   └── routes/
│   │       ├── health.py
│   │       ├── estimates.py
│   │       ├── pricing.py
│   │       ├── files.py           # Phase 2
│   │       └── folders.py         # Phase 2
│   │
│   ├── core/
│   │   ├── config.py              # Environment-driven settings
│   │   ├── database.py            # SQLAlchemy engine/session setup
│   │   ├── enums.py                # ColorMode / PrintType enums
│   │   ├── errors.py              # Centralized exception handlers
│   │   └── storage.py             # Storage abstraction (local filesystem, S3-ready) — Phase 2
│   │
│   ├── models/
│   │   ├── estimate.py            # PrintEstimate ORM model
│   │   ├── pricing.py             # PricingRate ORM model
│   │   ├── file.py                # FileRecord ORM model — Phase 2
│   │   └── folder.py              # Folder ORM model — Phase 2
│   │
│   ├── schemas/
│   │   ├── estimate.py            # Request/response schemas for estimates
│   │   ├── pricing.py             # Request/response schemas for pricing
│   │   ├── file.py                # Request/response schemas for files — Phase 2
│   │   └── folder.py              # Request/response schemas for folders — Phase 2
│   │
│   ├── services/
│   │   ├── cost_calculator.py     # Pure, framework-independent calculation engine
│   │   ├── pricing_service.py     # Pricing configuration business logic
│   │   ├── file_service.py        # Upload validation, storage orchestration — Phase 2
│   │   └── folder_service.py      # Folder business logic — Phase 2
│   │
│   └── repositories/
│       ├── estimate_repository.py # Estimate data access
│       ├── pricing_repository.py  # Pricing data access
│       ├── file_repository.py     # File data access, search/filter — Phase 2
│       └── folder_repository.py   # Folder data access — Phase 2
│
├── alembic/                       # Database migrations
│   └── versions/
│
├── storage/                       # Local file storage (dev only; git-ignored)
│
├── postman/
│   └── document_platform.postman_collection.json
│
├── tests/
│   ├── conftest.py
│   ├── test_health.py
│   ├── test_cost_calculator.py    # Unit tests for the calculation engine
│   ├── test_estimates.py          # API-level tests for estimate endpoints
│   ├── test_pricing.py            # API-level tests for pricing endpoints
│   ├── test_files.py              # API-level tests for file endpoints — Phase 2
│   └── test_folders.py            # API-level tests for folder endpoints — Phase 2
│
├── .env.example
├── .gitignore
├── alembic.ini
├── pytest.ini
├── requirements.txt
└── README.md
```

Architecture follows a strict layered separation:

```
Routes → Schemas → Services → Repositories → Database
```

The calculation engine (`services/cost_calculator.py`) has **zero
dependency** on FastAPI, the database, or any I/O — it is pure and
independently unit-testable.

---

## 4. Installation

From the `backend/` directory:

```bash
pip install -r requirements.txt --break-system-packages
```

(Omit `--break-system-packages` if you're using a virtual environment,
which is recommended: `python3 -m venv venv && source venv/bin/activate`.)

---

## 5. Environment Setup

Copy the example environment file and adjust as needed:

```bash
cp .env.example .env
```

Key variables:

```env
DATABASE_URL=sqlite:///./print_estimator.db
CURRENCY=INR
BW_SIMPLEX_PRICE=2.00
BW_DUPLEX_PRICE=1.50
COLOR_SIMPLEX_PRICE=10.00
COLOR_DUPLEX_PRICE=8.00
CORS_ORIGINS=*
ADMIN_API_KEY=change-me-in-production
```

**Pricing note:** the values above (₹2.00/₹1.50/₹10.00/₹8.00 per printed
side) are application *defaults*, not universal truths — see [Assumptions](#10-assumptions-made-about-the-pricing-model)
below. They can be changed either by editing `.env` (affects the seed
values used the first time the pricing table is populated) or, once the
service is running, via the admin pricing endpoint (see below) — no code
changes required either way.

### File storage configuration

```env
STORAGE_BACKEND=local
STORAGE_LOCAL_PATH=./storage
MAX_UPLOAD_SIZE_BYTES=52428800
ALLOWED_FILE_EXTENSIONS=pdf,doc,docx,ppt,pptx,xls,xlsx,txt,csv,jpg,jpeg,png,gif,webp,bmp
```

`STORAGE_BACKEND=local` stores uploaded file bytes on the local filesystem
under `STORAGE_LOCAL_PATH`. Swapping to a cloud backend (e.g. S3) in
production only requires implementing one new `StorageBackend` subclass in
`app/core/storage.py` and pointing `STORAGE_BACKEND` at it — no route,
service, or repository code changes needed, since everything above the
storage layer only depends on the abstract `StorageBackend` interface.

### Switching to PostgreSQL

Change one line in `.env`:

```env
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/print_estimator
```

No other code or configuration changes are required — the SQLAlchemy
engine, session handling, and Alembic migrations all read from this same
setting.

---

## 6. Database Setup (Migrations)

This project uses **Alembic** for schema management — not
`Base.metadata.create_all()`. The initial migration creates the
`print_estimates` and `pricing_rates` tables.

Run migrations:

```bash
python3 -m alembic upgrade head
```

To create a new migration after changing models:

```bash
python3 -m alembic revision --autogenerate -m "describe your change"
python3 -m alembic upgrade head
```

Alembic reads `DATABASE_URL` from the same application settings as the API
itself, so migrations and the running app can never drift apart.

---

## 7. Running the Server

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

---

## 8. API Usage

### Health Check

```bash
curl http://127.0.0.1:8000/health
```

```json
{"status": "ok"}
```

### Create an Estimate

```bash
curl -X POST http://127.0.0.1:8000/api/v1/estimates \
  -H "Content-Type: application/json" \
  -d '{
    "page_count": 100,
    "copies": 2,
    "color_mode": "bw",
    "print_type": "duplex"
  }'
```

```json
{
  "estimate_id": 1,
  "page_count": 100,
  "copies": 2,
  "color_mode": "bw",
  "print_type": "duplex",
  "printed_sides_per_copy": 100,
  "physical_sheets_per_copy": 50,
  "total_printed_sides": 200,
  "total_physical_sheets": 100,
  "price_per_printed_side": "1.50",
  "cost_per_copy": "150.00",
  "total_cost": "300.00",
  "currency": "INR",
  "created_at": "2026-09-02T20:49:26.662053"
}
```

### Get an Estimate

```bash
curl http://127.0.0.1:8000/api/v1/estimates/1
```

### List Estimates (paginated)

```bash
curl "http://127.0.0.1:8000/api/v1/estimates?page=1&page_size=20"
```

### Get Pricing Configuration

```bash
curl http://127.0.0.1:8000/api/v1/pricing
```

### Update Pricing (Admin only)

This is an **administrative operation**, protected by the `X-Admin-API-Key`
header, which must match the `ADMIN_API_KEY` configured in `.env`:

```bash
curl -X PUT http://127.0.0.1:8000/api/v1/pricing \
  -H "Content-Type: application/json" \
  -H "X-Admin-API-Key: change-me-in-production" \
  -d '{
    "color_mode": "bw",
    "print_type": "simplex",
    "price_per_printed_side": 2.50
  }'
```

Without a valid key, this returns `401 Unauthorized`.

---

## 9. Authentication — `X-User-Id` Header

The File Management module scopes every file and folder to an owner, but
this project does not implement a full user registration / login system —
that's out of scope for this module per the product spec, which asks for
file management, sharing, community, and admin functionality to be built
incrementally.

Instead, callers identify themselves with a simple header:

```
X-User-Id: <any non-empty string identifying the caller>
```

Every file/folder endpoint requires this header and returns `401` if it's
missing. All operations (upload, list, rename, move, delete) are
automatically scoped to that ID — one user can never see, modify, or even
learn of the existence of another user's files (mismatched ownership
returns `404`, not `403`, so as not to leak existence).

This is intentionally simple and is designed to be replaced with real
authentication (e.g. a JWT-based dependency that resolves the same
string) without touching any route, service, or repository — they only
depend on the resolved user ID string, not on how it was obtained.

---

## 10. File Management API Usage

### Create a Folder

```bash
curl -X POST http://127.0.0.1:8000/api/v1/folders \
  -H "Content-Type: application/json" \
  -H "X-User-Id: zeni" \
  -d '{"name": "Reports"}'
```

```json
{
  "id": 1,
  "name": "Reports",
  "owner_id": "zeni",
  "parent_folder_id": null,
  "created_at": "2026-09-02T20:58:10.876187",
  "updated_at": "2026-09-02T20:58:10.876193"
}
```

Nest a folder under another by passing `"parent_folder_id": <id>`.

### Upload a File

```bash
curl -X POST http://127.0.0.1:8000/api/v1/files \
  -H "X-User-Id: zeni" \
  -F "upload=@/path/to/report.txt" \
  -F "folder_id=1"
```

```json
{
  "id": 1,
  "filename": "report.txt",
  "extension": "txt",
  "content_type": "text/plain",
  "size_bytes": 22,
  "owner_id": "zeni",
  "folder_id": 1,
  "created_at": "2026-09-02T20:58:10.941271",
  "updated_at": "2026-09-02T20:58:10.941274"
}
```

Omit `folder_id` to upload to the root of the library. Supported formats:
PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, TXT, CSV, and common image formats
(configurable via `ALLOWED_FILE_EXTENSIONS`). Files exceeding
`MAX_UPLOAD_SIZE_BYTES` or with an unsupported extension are rejected with
`400`.

### Get File Metadata

```bash
curl http://127.0.0.1:8000/api/v1/files/1 -H "X-User-Id: zeni"
```

### Download a File

```bash
curl http://127.0.0.1:8000/api/v1/files/1/download \
  -H "X-User-Id: zeni" \
  -o report.txt
```

Streams the original bytes back with the original filename in
`Content-Disposition`.

### Rename or Move a File

```bash
curl -X PATCH http://127.0.0.1:8000/api/v1/files/1 \
  -H "Content-Type: application/json" \
  -H "X-User-Id: zeni" \
  -d '{"filename": "q3_report.txt", "folder_id": 2}'
```

Send `"move_to_root": true` to explicitly move a file out of any folder.

### List / Search Files

```bash
curl "http://127.0.0.1:8000/api/v1/files?q=report&extension=txt&folder_id=1&page=1&page_size=20" \
  -H "X-User-Id: zeni"
```

Supports free-text filename search (`q`), extension filtering
(`extension`), folder filtering (`folder_id`), and pagination.

### Delete a File

```bash
curl -X DELETE http://127.0.0.1:8000/api/v1/files/1 -H "X-User-Id: zeni"
```

Removes both the metadata row and the underlying stored bytes.

### Rename or Move a Folder

```bash
curl -X PATCH http://127.0.0.1:8000/api/v1/folders/1 \
  -H "Content-Type: application/json" \
  -H "X-User-Id: zeni" \
  -d '{"name": "Quarterly Reports"}'
```

### Delete a Folder

```bash
curl -X DELETE http://127.0.0.1:8000/api/v1/folders/1 -H "X-User-Id: zeni"
```

Folders must be empty (no files or subfolders) before deletion — the API
returns `400` otherwise, to prevent accidental data loss. Move or delete
the folder's contents first.

---

## 11. Testing

Run the full test suite:

```bash
pytest
```

The suite includes 83 tests covering:

- Health endpoint
- The calculation engine's actual numerical results for every spec example
  and edge case (1 page, odd page counts, multiple copies, color/B&W,
  simplex/duplex)
- Invalid input rejection (page count, copies, color mode, print type)
- Estimate creation, retrieval, and paginated listing
- Pricing retrieval and admin-protected pricing updates
- Folder creation (including nested folders), retrieval, listing, rename,
  move (including root-move and self-parent rejection), and deletion
  (including the empty-folder-only constraint)
- File upload (including folder placement, unsupported-type rejection,
  empty-file rejection, missing-folder rejection), metadata retrieval,
  byte-for-byte download verification, rename, move, deletion (including
  storage cleanup), and search/filter (by name, extension, folder) with
  pagination
- Cross-user ownership isolation for both files and folders (a user can
  never see or modify another user's documents)

Tests run against an isolated in-memory SQLite database **and** an
isolated temporary storage directory per test — they never touch your
local `print_estimator.db` or `storage/` directory.

---

## 12. Swagger / API Documentation

Once the server is running, interactive documentation is available at:

- **Swagger UI:** `http://127.0.0.1:8000/docs`
- **ReDoc:** `http://127.0.0.1:8000/redoc`
- **OpenAPI schema:** `http://127.0.0.1:8000/openapi.json`

Every endpoint includes a summary, description, request/response schemas,
and status codes.

---

## 13. Postman Collection

Located at:

```
postman/document_platform.postman_collection.json
```

Import it into Postman. It includes requests (with test assertions on
status codes, response structure, and calculated totals) organized into
two groups:

**Print Cost Estimation:**
- `GET /health`
- `POST /api/v1/estimates` (valid + invalid input cases)
- `GET /api/v1/estimates/{id}` (found + not-found cases)
- `GET /api/v1/estimates` (list/pagination)
- `GET /api/v1/pricing`
- `PUT /api/v1/pricing` (unauthorized + admin cases)

**File Management (Phase 2):**
- `POST /api/v1/folders`, `GET /api/v1/folders`, `PATCH /api/v1/folders/{id}`, `DELETE /api/v1/folders/{id}`
- `POST /api/v1/files` (upload — including an unsupported-type failure case)
- `GET /api/v1/files/{id}`, `GET /api/v1/files/{id}/download`
- `GET /api/v1/files` (list/search/filter)
- `PATCH /api/v1/files/{id}`, `DELETE /api/v1/files/{id}`
- A request demonstrating the `401` returned when `X-User-Id` is omitted

Collection variables `base_url`, `admin_api_key`, `user_id`, `folder_id`,
and `file_id` can be adjusted in Postman's variable panel. For the file
upload requests, attach a real file to the `upload` form field in
Postman before sending (Postman collections cannot embed binary file
attachments in the JSON export).

---

## 14. Assumptions Made About the Pricing Model

- Default rates (₹2.00 B&W simplex, ₹1.50 B&W duplex, ₹10.00 color
  simplex, ₹8.00 color duplex, per printed side) are illustrative
  defaults only, sourced from environment variables and seeded into a
  database-backed pricing table on first use — they are **not** assumed
  to reflect real-world print shop pricing.
- "Printed sides" always equals the document page count — duplex printing
  only changes how many *sides* fit on one *physical sheet*, not how many
  sides get printed.
- For duplex printing with an odd page count, the final physical sheet is
  printed on one side only (ceiling division: `⌈page_count / 2⌉` sheets).
- All monetary rounding uses standard half-up rounding to 2 decimal places
  (paise-level precision), applied via `Decimal`.
- The admin pricing-update endpoint uses a simple shared-secret header
  (`X-Admin-API-Key`) rather than a full auth/roles system, per the
  instruction to avoid unnecessary authentication complexity while still
  requiring the endpoint to be protected.

---

## 15. Known Limitations

- Admin authorization is a single static shared secret, not a full
  user/role-based auth system — sufficient for protecting this one
  administrative operation, but would need to be replaced with proper
  auth (e.g. JWT + roles) if more admin functionality is added later.
- Pricing history is not tracked — updating a rate overwrites the previous
  value rather than versioning it. Estimates already created retain the
  price that was in effect at calculation time (stored on the estimate
  itself), but there's no separate historical rate log.
- No rate limiting is implemented on any endpoint.
- CORS is configured via a single `CORS_ORIGINS` environment variable
  (comma-separated list, or `*`); more granular per-route CORS policies
  are not supported.
- **File Management (Phase 2)** has no real authentication — user identity
  is a caller-supplied `X-User-Id` header (see [Authentication](#9-authentication--x-user-id-header)),
  not a verified login. This is intentional for this phase, but means the
  header must be set by a trusted layer (e.g. an API gateway or a future
  auth middleware) before this is exposed publicly.
- File sharing (public links, permissions, password protection,
  expiration) is **not** part of this phase — only single-owner private
  file management is implemented, per the phased build plan.
- Only the "local" storage backend is implemented. The `StorageBackend`
  abstraction is designed so an S3-compatible backend can be added later
  without touching routes, services, or repositories, but no such backend
  ships yet.
- Folder deletion requires the folder to be empty; there is no
  recursive/cascade delete of a folder and its contents.
- File versioning is not implemented — uploading a new file always
  creates a new record; there's no revision history for a single logical
  document.
