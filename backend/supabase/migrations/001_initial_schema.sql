-- ============================================================================
-- Document Platform - Supabase Initial Schema
-- Paste this entire file into: Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- USERS -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_users_email ON public.users(email);

-- FOLDERS ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.folders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_id VARCHAR(128) NOT NULL,
    parent_folder_id INTEGER REFERENCES public.folders(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_folders_owner_id ON public.folders(owner_id);
CREATE INDEX IF NOT EXISTS ix_folders_parent_folder_id ON public.folders(parent_folder_id);

-- FILES --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.files (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    extension VARCHAR(16) NOT NULL,
    content_type VARCHAR(128) NOT NULL,
    size_bytes BIGINT NOT NULL,
    storage_key VARCHAR(512) NOT NULL UNIQUE,
    owner_id VARCHAR(128) NOT NULL,
    folder_id INTEGER REFERENCES public.folders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_files_owner_id ON public.files(owner_id);
CREATE INDEX IF NOT EXISTS ix_files_folder_id ON public.files(folder_id);
CREATE INDEX IF NOT EXISTS ix_files_storage_key ON public.files(storage_key);

-- SHARE LINKS --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.share_links (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(32) NOT NULL UNIQUE,
    file_id INTEGER NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
    owner_id VARCHAR(128) NOT NULL,
    permission VARCHAR(16) NOT NULL,
    password_hash VARCHAR(255),
    expires_at TIMESTAMPTZ,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    view_count BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_share_links_slug ON public.share_links(slug);
CREATE INDEX IF NOT EXISTS ix_share_links_file_id ON public.share_links(file_id);
CREATE INDEX IF NOT EXISTS ix_share_links_owner_id ON public.share_links(owner_id);

-- PRINT ESTIMATES ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.print_estimates (
    id SERIAL PRIMARY KEY,
    page_count INTEGER NOT NULL,
    copies INTEGER NOT NULL,
    color_mode VARCHAR(10) NOT NULL,
    print_type VARCHAR(10) NOT NULL,
    price_per_printed_side NUMERIC(12, 2) NOT NULL,
    printed_sides_per_copy INTEGER NOT NULL,
    physical_sheets_per_copy INTEGER NOT NULL,
    total_printed_sides INTEGER NOT NULL,
    total_physical_sheets INTEGER NOT NULL,
    cost_per_copy NUMERIC(12, 2) NOT NULL,
    total_cost NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_print_estimates_created_at ON public.print_estimates(created_at);

-- PRICING RATES ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pricing_rates (
    id SERIAL PRIMARY KEY,
    key VARCHAR(32) NOT NULL UNIQUE,
    color_mode VARCHAR(10) NOT NULL,
    print_type VARCHAR(10) NOT NULL,
    price_per_printed_side NUMERIC(12, 2) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_pricing_rates_key ON public.pricing_rates(key);

-- Seed default pricing rates
INSERT INTO public.pricing_rates (key, color_mode, print_type, price_per_printed_side) VALUES
    ('bw_simplex',   'bw',    'simplex', 2.50),
    ('bw_duplex',    'bw',    'duplex',  2.50),
    ('color_simplex','color', 'simplex', 8.00),
    ('color_duplex', 'color', 'duplex',  8.00)
ON CONFLICT (key) DO NOTHING;

-- COMMUNITY REQUESTS -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_requests (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    tags VARCHAR(512) NOT NULL,
    author_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_community_requests_author_id ON public.community_requests(author_id);
CREATE INDEX IF NOT EXISTS ix_community_requests_status ON public.community_requests(status);

-- COMMUNITY OFFERS ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_offers (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES public.community_requests(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    file_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_community_offers_request_id ON public.community_offers(request_id);
CREATE INDEX IF NOT EXISTS ix_community_offers_author_id ON public.community_offers(author_id);

-- ============================================================================
-- 3. UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at          ON public.users;
DROP TRIGGER IF EXISTS trg_folders_updated_at        ON public.folders;
DROP TRIGGER IF EXISTS trg_files_updated_at          ON public.files;
DROP TRIGGER IF EXISTS trg_pricing_rates_updated_at  ON public.pricing_rates;
DROP TRIGGER IF EXISTS trg_community_requests_updated_at ON public.community_requests;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_folders_updated_at
    BEFORE UPDATE ON public.folders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_files_updated_at
    BEFORE UPDATE ON public.files
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_pricing_rates_updated_at
    BEFORE UPDATE ON public.pricing_rates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_community_requests_updated_at
    BEFORE UPDATE ON public.community_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 4. STORAGE BUCKET
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) — disabled for service-role access
-- ============================================================================
-- The FastAPI backend uses the SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.
-- We keep RLS disabled on these tables because authentication happens via JWT
-- in the FastAPI app, not via Supabase Auth. Re-enable + add policies if you
-- later migrate to Supabase Auth.

ALTER TABLE public.users              DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.files              DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_links        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_estimates    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rates      DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_offers   DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. STORAGE RLS POLICIES — allow service role to manage files
-- ============================================================================
-- Drop existing policies if they exist (safe re-run)
DROP POLICY IF EXISTS "service_role_all_documents" ON storage.objects;

-- Allow backend (service role) full access to the documents bucket
CREATE POLICY "service_role_all_documents"
    ON storage.objects
    FOR ALL
    TO service_role
    USING (bucket_id = 'documents')
    WITH CHECK (bucket_id = 'documents');

-- ============================================================================
-- DONE. Verify in Supabase:
--   Table Editor > should see: users, folders, files, share_links,
--                               print_estimates, pricing_rates,
--                               community_requests, community_offers
--   Storage > should see bucket: documents
-- ============================================================================
