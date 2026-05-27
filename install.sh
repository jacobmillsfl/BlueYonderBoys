#!/usr/bin/env bash
# First-time setup: credentials, JWT secret, and .env for Docker Compose.
# Run once from the repo root before docker compose or applyUpdate.sh.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ENV_FILE=".env"

if [[ -f "$ENV_FILE" ]]; then
  read -r -p ".env already exists. Overwrite? [y/N] " confirm
  if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Keeping existing .env"
    exit 0
  fi
fi

read -r -p "Admin username: " ADMIN_USERNAME
read -r -s -p "Admin password: " ADMIN_PASSWORD
echo ""
read -r -s -p "Confirm password: " ADMIN_PASSWORD_CONFIRM
echo ""

if [[ -z "$ADMIN_USERNAME" || -z "$ADMIN_PASSWORD" ]]; then
  echo "ERROR: Username and password are required."
  exit 1
fi

if [[ "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD_CONFIRM" ]]; then
  echo "ERROR: Passwords do not match."
  exit 1
fi

JWT_SECRET="$(openssl rand -base64 48 | tr -d '\n')"

cat > "$ENV_FILE" <<EOF
ADMIN_USERNAME=${ADMIN_USERNAME}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
JWT_SECRET=${JWT_SECRET}
APP_PORT=8080
API_PORT=8000
EOF

chmod 600 "$ENV_FILE"

mkdir -p backend/database/uploads

echo ""
echo "Created .env and backend/database/uploads/"
echo "Next: ./applyUpdate.sh   (or: docker compose up -d --build)"
