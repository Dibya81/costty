#!/bin/bash
# ============================================================
# Supabase Setup Helper
# Run this after creating your Supabase project to verify setup
# ============================================================

set -e

echo "🚀 Document Platform - Supabase Setup"
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "   Run: cp .env.example .env"
    echo "   Then edit .env with your Supabase credentials"
    exit 1
fi

# Check for required variables
required_vars=("DATABASE_URL" "SUPABASE_URL" "SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY")

for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env; then
        echo "❌ Missing required variable: ${var}"
        exit 1
    fi
done

echo "✅ .env file looks good"
echo ""

# Activate venv if it exists
if [ -d ".venv" ]; then
    source .venv/bin/activate
    echo "✅ Activated virtual environment"
fi

# Install/verify dependencies
echo "📦 Installing dependencies..."
pip install -q -r requirements.txt

# Run migrations
echo "🗃️  Running database migrations..."
alembic upgrade head

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Make sure you've run the SQL in backend/supabase/migrations/001_initial_schema.sql in your Supabase SQL Editor"
echo "  2. Create a 'documents' storage bucket in Supabase Dashboard > Storage"
echo "  3. Start the server: uvicorn app.main:app --reload"
