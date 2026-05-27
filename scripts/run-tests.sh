#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: python3 is required to run backend tests."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm is required to run frontend tests."
  exit 1
fi

echo "==> Backend unit tests"
cd "$ROOT/backend"
VENV_DIR="$ROOT/backend/.venv-test"
if [[ ! -d "$VENV_DIR" ]]; then
  python3 -m venv "$VENV_DIR"
fi
# shellcheck source=/dev/null
source "$VENV_DIR/bin/activate"
python -m pip install -q -r requirements.txt -r requirements-dev.txt
export DATABASE_DIR="$ROOT/backend/tests/.pytest_db"
mkdir -p "$DATABASE_DIR"
export ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
export ADMIN_PASSWORD="${ADMIN_PASSWORD:-test-password}"
export JWT_SECRET="${JWT_SECRET:-test-jwt-secret}"
python -m pytest -q
deactivate

echo "==> Frontend unit tests"
cd "$ROOT/frontend"
if [[ ! -d node_modules ]]; then
  npm ci
fi
npm test

echo "All tests passed."
