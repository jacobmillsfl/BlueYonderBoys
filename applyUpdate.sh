#!/usr/bin/env bash
# Zero-downtime-ish deploy: build new images while the stack is still running,
# then recreate containers only after a successful build (no `compose down` first).
#
# Data lives on the host:
#   ./backend/database/blueyonderboys.db
#   ./backend/database/uploads/
# Back these up before risky operations.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [[ ! -f .env ]]; then
  echo "ERROR: .env not found. Run ./install.sh first."
  exit 1
fi

if [[ -n "${COMPOSE_PROJECT_NAME:-}" ]]; then
  PROJECT_NAME="$(printf '%s' "$COMPOSE_PROJECT_NAME" | tr '[:upper:]' '[:lower:]')"
else
  PROJECT_NAME="$(basename "$SCRIPT_DIR" | tr '[:upper:]' '[:lower:]')"
fi
export COMPOSE_PROJECT_NAME="$PROJECT_NAME"

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

if docker compose version >/dev/null 2>&1; then
  DC=(docker compose)
else
  DC=(docker-compose)
fi

if [[ "${1:-}" == "--pull" ]]; then
  echo "==> git pull"
  git pull
fi

#echo "==> Run unit tests (must pass before deploy)"
#chmod +x "$SCRIPT_DIR/scripts/run-tests.sh"
#"$SCRIPT_DIR/scripts/run-tests.sh"

echo "==> Build images (services keep running until up -d recreates them)"
"${DC[@]}" build

echo "==> Recreate containers with new images"
"${DC[@]}" up -d --remove-orphans

echo "==> Prune dangling images (optional cleanup)"
docker image prune -f || true

echo "==> Status"
"${DC[@]}" ps

# Use the host port from docker-compose.yml (not APP_PORT in .env, which may differ).
FRONTEND_PORT="$("${DC[@]}" port frontend 80 2>/dev/null | sed -n 's/.*:\([0-9]*\)$/\1/p' || true)"
if [[ -z "$FRONTEND_PORT" ]]; then
  FRONTEND_PORT="$(sed -n 's/.*"\([0-9]*\):80".*/\1/p' docker-compose.yml | head -1)"
fi
FRONTEND_PORT="${FRONTEND_PORT:-8082}"
if curl -sf --max-time 5 "http://127.0.0.1:${FRONTEND_PORT}/" >/dev/null; then
  echo "OK: Site responded on http://127.0.0.1:${FRONTEND_PORT}/"
else
  echo "NOTE: Site check failed (http://127.0.0.1:${FRONTEND_PORT}/). Logs: ${DC[*]} logs -f frontend"
fi

echo "Done."
