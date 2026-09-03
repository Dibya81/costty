"""Tests for application configuration, particularly the CORS security fix."""

from app.core.config import Settings


def test_default_cors_origins_is_not_wildcard():
    """
    Regression test for a real audit finding: the default CORS_ORIGINS must
    not be '*', because allow_credentials=True is set in app.main — a
    wildcard origin combined with credentials causes the request's actual
    Origin header to be echoed back as allowed, granting credentialed
    access to any site.
    """
    settings = Settings(_env_file=None)
    assert settings.cors_origins != "*"
    assert "localhost" in settings.cors_origins


def test_cors_origin_list_parses_comma_separated_values():
    settings = Settings(_env_file=None, cors_origins="http://a.com,http://b.com")
    assert settings.cors_origin_list == ["http://a.com", "http://b.com"]


def test_cors_origin_list_still_supports_explicit_wildcard_if_configured():
    """Wildcard remains available for callers who explicitly opt into it."""
    settings = Settings(_env_file=None, cors_origins="*")
    assert settings.cors_origin_list == ["*"]
