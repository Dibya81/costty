"""
One-shot CLI to promote (or create) an admin user.

Usage:
    python -m scripts.seed_admin --email admin@example.com --password "secret123" --name "Admin"

If a user with the given email already exists, sets is_admin=True.
Otherwise, creates a new user and sets is_admin=True.
"""

import argparse
import sys

from app.core.database import SessionLocal
from app.models.user import User
from app.services.auth_service import hash_password


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True, help="Minimum 8 characters.")
    parser.add_argument("--name", default="Administrator")
    args = parser.parse_args()

    if len(args.password) < 8:
        print("Password must be at least 8 characters.", file=sys.stderr)
        return 1

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == args.email.lower().strip()).first()
        if user is None:
            user = User(
                email=args.email.lower().strip(),
                hashed_password=hash_password(args.password),
                full_name=args.name.strip(),
                is_admin=True,
                is_active=True,
            )
            db.add(user)
            db.commit()
            print(f"Created admin user {user.email} (id={user.id})")
        else:
            user.is_admin = True
            user.is_active = True
            db.commit()
            print(f"Promoted existing user {user.email} to admin (id={user.id})")
    finally:
        db.close()

    return 0


if __name__ == "__main__":
    sys.exit(main())
