"""
Application configuration.

All configurable values are sourced from environment variables (via a `.env`
file in development). Nothing here should require a source-code change to
alter pricing, database, or CORS behaviour in a different environment.
"""

from decimal import Decimal
from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central application settings, loaded from environment / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Application ---
    app_name: str = "Print Cost Estimation Service"
    app_env: str = "development"
    debug: bool = True

    # --- Database ---
    database_url: str = "sqlite:///./print_estimator.db"

    # --- Currency ---
    currency: str = "INR"

    # --- Default pricing (per printed side, in INR) ---
    # Pricing rules from product spec: every printed side is billed at the
    # color-mode rate. Simplex vs duplex only changes how many physical
    # sheets those sides land on, not how many sides get ink.
    bw_simplex_price: Decimal = Decimal("2.50")
    bw_duplex_price: Decimal = Decimal("2.50")
    color_simplex_price: Decimal = Decimal("8.00")
    color_duplex_price: Decimal = Decimal("8.00")

    # --- CORS ---
    # NOTE: allow_credentials is True in app.main (needed for future
    # authenticated requests), and per CORS semantics a wildcard origin
    # combined with credentials causes the actual request origin to be
    # echoed back as allowed — i.e. "*" here does NOT mean "safely open",
    # it means "any origin gets credentialed access". Default to explicit
    # local dev origins instead; set real origins via env in production.
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    # --- Pagination ---
    default_page_size: int = 20
    max_page_size: int = 100

    # --- Admin ---
    admin_api_key: str = "change-me-in-production"

    # --- Authentication ---
    jwt_secret: str = "change-me-in-production-jwt"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 8  # 8 hours

    # --- Supabase ---
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_storage_bucket: str = "documents"

    # --- File storage ---
    # "local" uses the filesystem; "supabase" uses Supabase Storage
    storage_backend: str = "local"
    storage_local_path: str = "./storage"
    max_upload_size_bytes: int = 50 * 1024 * 1024  # 50 MB
    allowed_file_extensions: str = (
        "pdf,doc,docx,ppt,pptx,xls,xlsx,txt,csv,jpg,jpeg,png,gif,webp,bmp"
    )

    @property
    def allowed_extensions_set(self) -> set[str]:
        return {
            ext.strip().lower().lstrip(".")
            for ext in self.allowed_file_extensions.split(",")
            if ext.strip()
        }

    @field_validator(
        "bw_simplex_price",
        "bw_duplex_price",
        "color_simplex_price",
        "color_duplex_price",
        mode="before",
    )
    @classmethod
    def _coerce_decimal(cls, value: object) -> object:
        if isinstance(value, (int, float, str)):
            return Decimal(str(value))
        return value

    @property
    def cors_origin_list(self) -> List[str]:
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance (loaded once per process)."""
    return Settings()
