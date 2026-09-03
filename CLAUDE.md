# Document Platform - Project Context

## Project Overview

This is a full-stack document management platform with print cost estimation, file sharing, and community features.

**Stack:**
- Frontend: React 19 + TypeScript + Vite + TailwindCSS
- Backend: FastAPI (Python) + SQLAlchemy 2.0
- Database: PostgreSQL via Supabase (migrated from SQLite)
- Storage: Supabase Storage (or local filesystem)
- Auth: JWT (HS256)

## Architecture

- **Backend**: FastAPI with SQLAlchemy ORM, Pydantic schemas, Alembic migrations
- **Frontend**: React with React Router, lazy-loaded pages, auth context
- **Database**: SQLAlchemy models in `backend/app/models/`, migrations in `backend/alembic/versions/`
- **Supabase**: Used for PostgreSQL database + Storage. SQL schema is in `backend/supabase/migrations/001_initial_schema.sql`

## Key Files

| Path | Purpose |
|---|---|
| `backend/app/main.py` | FastAPI app entrypoint |
| `backend/app/core/config.py` | Environment config (Settings class) |
| `backend/app/core/database.py` | SQLAlchemy engine + session |
| `backend/app/core/storage.py` | Local/Supabase storage abstraction |
| `backend/app/core/supabase.py` | Supabase client for backend |
| `backend/supabase/migrations/001_initial_schema.sql` | Full DB schema for Supabase |
| `frontend/src/lib/api.ts` | Central API client |
| `frontend/src/lib/supabase.ts` | Supabase client for frontend |
| `frontend/src/lib/AuthContext.tsx` | Auth state management |

## Common Tasks

### Running locally
```bash
# Backend
cd backend && source .venv/bin/activate && uvicorn app.main:app --reload

# Frontend
cd frontend && npm run dev
```

### Running migrations (after model changes)
```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Supabase Setup
1. Run `backend/supabase/migrations/001_initial_schema.sql` in Supabase SQL Editor
2. Create a `documents` storage bucket in Supabase Storage
3. Configure `.env` with Supabase credentials

## Environment Variables

See `.env.example` in both `backend/` and `frontend/` directories.

Backend uses `app/core/config.py` which reads from `.env`.

Frontend uses Vite env vars prefixed with `VITE_` which are embedded at build time.
