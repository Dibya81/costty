"""
Supabase client initialization.

This module provides Supabase client instances for backend operations:
- admin_client: Uses service role key (bypasses RLS) - for admin operations
- public_client: Uses anon key - for user-level operations with RLS
"""

import logging

from supabase import Client, create_client

from app.core.config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()

_supabase_admin_client: Client | None = None
_supabase_public_client: Client | None = None


def get_supabase_admin() -> Client:
    """Get Supabase client with service role key (bypasses RLS).

    Use this for backend operations that need full database access.
    """
    global _supabase_admin_client
    if _supabase_admin_client is None:
        if not settings.supabase_url or not settings.supabase_service_role_key:
            raise ValueError(
                "Supabase URL and service role key must be configured. "
                "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env"
            )
        _supabase_admin_client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key,
        )
    return _supabase_admin_client


def get_supabase_public() -> Client:
    """Get Supabase client with anon key (subject to RLS).

    Use this for user-level operations.
    """
    global _supabase_public_client
    if _supabase_public_client is None:
        if not settings.supabase_url or not settings.supabase_anon_key:
            raise ValueError(
                "Supabase URL and anon key must be configured. "
                "Set SUPABASE_URL and SUPABASE_ANON_KEY in .env"
            )
        _supabase_public_client = create_client(
            settings.supabase_url,
            settings.supabase_anon_key,
        )
    return _supabase_public_client
