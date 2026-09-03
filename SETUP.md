# Supabase Setup Guide

This document explains how to wire up Supabase (PostgreSQL + Storage + Auth) to the Document Platform.

## Step 1: Create a Supabase Project

1. Sign up at [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish provisioning (~2 minutes)
3. Note your project reference (visible in the URL: `https://<ref>.supabase.co`)

## Step 2: Run the Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `backend/supabase/migrations/001_initial_schema.sql`
4. Paste and click **Run**
5. Verify: go to **Table Editor** — you should see `users`, `files`, `folders`, `share_links`, `print_estimates`, `pricing_rates`, `community_requests`, `community_offers`

## Step 3: Create Storage Bucket

1. Go to **Storage** in the Supabase Dashboard
2. Click **New Bucket**
3. Name: `documents`
4. Toggle **Private** (recommended)
5. Click **Create Bucket**

## Step 4: Get Your Credentials

1. Go to **Settings > API**
2. Copy:
   - **Project URL** (e.g., `https://abcdefg.supabase.co`) → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key (click "reveal" first) → `SUPABASE_SERVICE_ROLE_KEY`
3. Go to **Settings > Database > Connection string > URI**
4. Copy the URI → `DATABASE_URL`
   - Format: `postgresql+psycopg://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`

## Step 5: Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in:
```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@db.YOUR_REF.supabase.co:5432/postgres
SUPABASE_URL=https://YOUR_REF.supabase.co
SUPABASE_ANON_KEY=eyJhbGc... (your anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (your service role key)
SUPABASE_STORAGE_BUCKET=documents
STORAGE_BACKEND=supabase
JWT_SECRET=<generate a random 32+ char string>
CORS_ORIGINS=http://localhost:5173
```

Generate a JWT secret:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Step 6: Run Migrations

```bash
cd backend
source .venv/bin/activate  # or create venv first
pip install -r requirements.txt
alembic upgrade head
```

## Step 7: Start Backend

```bash
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` to confirm the API is working.

## Step 8: Configure Frontend

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://YOUR_REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... (your anon key)
VITE_SUPABASE_STORAGE_BUCKET=documents
```

## Step 9: Start Frontend

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`. You can now register a new account and the data will be persisted to Supabase.

## Verification Checklist

- [ ] All 8 tables exist in Supabase Table Editor
- [ ] Storage bucket `documents` exists
- [ ] `alembic upgrade head` ran without errors
- [ ] Backend starts on port 8000
- [ ] `/api/v1/health` returns 200
- [ ] Frontend starts on port 5173
- [ ] You can register a user via the UI
- [ ] The new user appears in the `users` table in Supabase

## Troubleshooting

### "relation does not exist" errors
You skipped Step 2. Run the SQL in `backend/supabase/migrations/001_initial_schema.sql`.

### CORS errors in browser
Add your frontend URL to `CORS_ORIGINS` in `backend/.env`, then restart the backend.

### "Invalid API key" errors
Double-check `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct and have no trailing spaces.

### Storage upload fails
Make sure the `documents` bucket exists in Supabase Storage.

### Alembic can't connect
Test your `DATABASE_URL` directly:
```bash
psql "postgresql+psycopg://postgres:YOUR_PASSWORD@db.YOUR_REF.supabase.co:5432/postgres"
```

## Notes

- The SQL schema in `001_initial_schema.sql` includes Row Level Security (RLS) policies. If you want to use Supabase Auth directly, these policies are already in place. If you continue using the FastAPI JWT system, the backend uses the service role key which bypasses RLS — the RLS policies then become a backup safety net.
- The `is_admin_user()` function reads the `users` table directly. It only works correctly if you've used the FastAPI auth system to create users, or if you sync the Supabase `auth.users` table with the public `users` table.
