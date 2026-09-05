# COSTTY — Deployment Runbook

Two services, one database. After this is set up, you will be able to upload documents from the Vercel frontend, which will hit the Render backend, which will store files in Supabase Storage and rows in Supabase Postgres.

```
[Browser]
   │
   │  VITE_API_URL
   ▼
[Vercel: React frontend]  ──── only env var needed ────▶  VITE_API_URL
   │
   │  HTTPS (JWT in Authorization header)
   ▼
[Render: FastAPI backend]
   │
   │  SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
   ▼
[Supabase project: bbxezevjnlubszdlkyuo]
   ├── Postgres (rows)
   └── Storage bucket: documents (files)
```

The frontend **does not** use Supabase at all. All Supabase credentials live on the backend only.

---

## STEP 1 — Run the SQL schema (one-time, in Supabase)

1. Open: https://supabase.com/dashboard/project/bbxezevjnlubszdlkyuo/sql/new
2. Open the file `backend/supabase/migrations/001_initial_schema.sql` from this repo
3. Copy the **entire** contents, paste into the SQL editor, click **Run** (or press Ctrl/Cmd+Enter)
4. You should see "Success. No rows returned" — that's expected for DDL.

Verify in **Table Editor** (left sidebar): you should see 8 tables — `users`, `folders`, `files`, `share_links`, `print_estimates`, `pricing_rates`, `community_requests`, `community_offers`.

Verify in **Storage** (left sidebar): you should see a `documents` bucket marked **Private**.

> If the SQL fails because tables already exist with a different shape, go to **SQL Editor**, run `DROP TABLE IF EXISTS public.community_offers, public.community_requests, public.pricing_rates, public.print_estimates, public.share_links, public.files, public.folders, public.users CASCADE;` then re-run the schema. You will lose any data — only do this on a fresh project.

---

## STEP 2 — Get the right keys from Supabase

Open: https://supabase.com/dashboard/project/bbxezevjnlubszdlkyuo/settings/api

You need **two** values, both starting with `eyJ...` (NOT `sb_publishable_...`):

| Field | Where to find it | What it starts with |
|---|---|---|
| `SUPABASE_ANON_KEY` | The **"anon"** row, **"public"** column | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_SERVICE_ROLE_KEY` | The **"service_role"** row, **"secret"** column | `eyJhbGciOiJIUzI1NiIs...` |

Also: confirm `SUPABASE_URL` is `https://bbxezevjnlubszdlkyuo.supabase.co` (shown at the top of the same page).

**Reset the DB password** if you don't have it: **Settings → Database → Database password → Reset database password**. Save the new password.

---

## STEP 3 — Configure Render (backend)

Open: https://dashboard.render.com → your `costty` service → **Environment** tab → **Add Environment Variable** for each:

| Key | Value |
|---|---|
| `APP_NAME` | `COSTTY API` |
| `APP_ENV` | `production` |
| `DEBUG` | `false` |
| `DATABASE_URL` | `postgresql+psycopg://postgres.bbxezevjnlubszdlkyuo:<DB_PASSWORD>@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres` |
| `SUPABASE_URL` | `https://bbxezevjnlubszdlkyuo.supabase.co` |
| `SUPABASE_ANON_KEY` | *(paste the `sb_publishable_...` or `eyJ...` anon key — do NOT commit this to git)* |
| `SUPABASE_SERVICE_ROLE_KEY` | *(paste the `sb_secret_...` or `eyJ...` service_role key — do NOT commit this to git)* |
| `SUPABASE_STORAGE_BUCKET` | `documents` |
| `STORAGE_BACKEND` | `supabase` |
| `CORS_ORIGINS` | `https://frontend-one-orcin-59.vercel.app,https://frontend-git-main-dibya-bhusals-projects.vercel.app,https://frontend-ck8anu51g-dibya-bhusals-projects.vercel.app` |
| `JWT_SECRET` | *(run `openssl rand -hex 32` in your terminal, paste output)* |
| `JWT_ALGORITHM` | `HS256` |
| `JWT_EXPIRE_MINUTES` | `480` |
| `BW_SIMPLEX_PRICE` | `2.50` |
| `BW_DUPLEX_PRICE` | `2.50` |
| `COLOR_SIMPLEX_PRICE` | `8.00` |
| `COLOR_DUPLEX_PRICE` | `8.00` |
| `CURRENCY` | `INR` |
| `MAX_UPLOAD_SIZE_BYTES` | `52428800` |
| `ALLOWED_FILE_EXTENSIONS` | `pdf,doc,docx,ppt,pptx,xls,xlsx,txt,csv,jpg,jpeg,png,gif,webp,bmp` |
| `DEFAULT_PAGE_SIZE` | `20` |
| `MAX_PAGE_SIZE` | `100` |

> **Important:** if your database password contains special characters (`!`, `@`, `#`, etc.), URL-encode them in `DATABASE_URL`. `@` → `%40`, `!` → `%21`, `#` → `%23`, ` ` → `%20`. If you set it to a clean alphanumeric password, you don't need to encode.

After saving all env vars, Render auto-redeploys. Watch the **Logs** tab — you should see:
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:10000
```
… and no SQLAlchemy connection errors.

Test it: visit `https://costty.onrender.com/api/v1/health` — should return `{"status":"ok"}`.

---

## STEP 4 — Configure Vercel (frontend)

Open: https://vercel.com/dashboard → your `frontend` project → **Settings** → **Environment Variables**.

Delete `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_STORAGE_BUCKET` if present.

Add **only this one**:

| Key | Value | Environments |
|---|---|---|
| `VITE_API_URL` | `https://costty.onrender.com` | Production, Preview, Development |

Click **Save**, then go to **Deployments** → click the three dots on the latest → **Redeploy** → **uncheck** "Use existing Build Cache" → **Redeploy**. The uncheck is required because Vite bakes env vars at build time.

After the redeploy completes, open the Vercel URL, log in, and try uploading a file. The upload should:
1. POST to `https://costty.onrender.com/api/v1/files` (your Vercel env var points here)
2. Backend stores the file in Supabase Storage `documents` bucket
3. Backend inserts a row in `public.files`

To verify in Supabase:
- **Table Editor → files**: should show your new row within a second
- **Storage → documents bucket**: should show the uploaded file

---

## STEP 5 — Smoke test

From a terminal:
```bash
# Health check
curl https://costty.onrender.com/api/v1/health
# → {"status":"ok"}

# Try the docs page
open https://frontend-one-orcin-59.vercel.app/app/documents
```

If you see "Failed to fetch" in the browser console after the Vercel redeploy, double-check:
- `VITE_API_URL` in Vercel is exactly `https://costty.onrender.com` (no trailing slash)
- The redeploy actually used the new env var (look at the build log)
- The backend is live (check Render's status)

If upload returns 500:
- Check Render logs for the actual error
- Most common: wrong database password, or `documents` bucket doesn't exist

---

## File changes made in this cleanup

- `frontend/src/lib/supabase.ts` — **deleted** (was unused)
- `frontend/package.json` — removed `@supabase/supabase-js` dependency
- `frontend/.env` / `.env.example` — now only contains `VITE_API_URL`
- `backend/.env` — refreshed with correct placeholders and `postgresql+psycopg://` scheme
- `backend/supabase/migrations/001_initial_schema.sql` — rewritten to be fully idempotent with explicit GRANTs and `CHANGE_ME` placeholders in the .env comments
- `DEPLOY_RUNBOOK.md` — this file
- `frontend/vercel.json` — kept the SPA rewrite (already done in previous step)
