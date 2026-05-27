#!/usr/bin/env bash
# Reproduce the server Docker frontend build locally (no git commit required).
# Exits non-zero if the image fails to build or smoke checks fail.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "ERROR: .env not found. Run ./install.sh first."
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  DC=(docker compose)
else
  DC=(docker-compose)
fi

FRONTEND_PORT="$("${DC[@]}" port frontend 80 2>/dev/null | sed -n 's/.*:\([0-9]*\)$/\1/p' || true)"
if [[ -z "$FRONTEND_PORT" ]]; then
  FRONTEND_PORT="$(sed -n 's/.*"\([0-9]*\):80".*/\1/p' "$ROOT/docker-compose.yml" | head -1)"
fi
FRONTEND_PORT="${FRONTEND_PORT:-8082}"

echo "==> [1/4] Simulate server host: production npm ci in frontend/"
cd "$ROOT/frontend"
rm -rf node_modules dist
export NODE_ENV=production
export NPM_CONFIG_PRODUCTION=true
npm ci --omit=dev
if [[ -x node_modules/vite/bin/vite.js ]]; then
  echo "OK: vite is installed with --omit=dev (build tools are in dependencies)"
else
  echo "ERROR: vite missing after npm ci --omit=dev — Docker build will fail on server"
  exit 1
fi
cd "$ROOT"

echo "==> [2/4] Docker build frontend with NODE_ENV=production (no cache)"
export NODE_ENV=production
export NPM_CONFIG_PRODUCTION=true
export DOCKER_BUILDKIT=1
"${DC[@]}" build frontend --no-cache --progress=plain 2>&1 | tee /tmp/byb-frontend-docker-build.log

if ! grep -q "vite v" /tmp/byb-frontend-docker-build.log; then
  echo "ERROR: build log does not show vite running"
  exit 1
fi
if grep -q "vite: not found" /tmp/byb-frontend-docker-build.log; then
  echo "ERROR: vite not found during docker build"
  exit 1
fi
echo "OK: vite build ran inside Docker"

echo "==> [3/4] Start stack"
"${DC[@]}" up -d --remove-orphans
sleep 3

echo "==> [4/4] Smoke checks on http://127.0.0.1:${FRONTEND_PORT}/"
for path in / /img/BYB_Street_Small.png /img/BYB_Name_V2.png; do
  code="$(curl -sf -o /dev/null -w "%{http_code}" "http://127.0.0.1:${FRONTEND_PORT}${path}" || echo "000")"
  if [[ "$code" != "200" ]]; then
    echo "FAIL ${path} -> HTTP ${code}"
    exit 1
  fi
  echo "OK   ${path} -> ${code}"
done

echo "Waiting for backend (API proxy)..."
for _ in 1 2 3 4 5 6 7 8 9 10; do
  code="$(curl -sf -o /dev/null -w "%{http_code}" "http://127.0.0.1:${FRONTEND_PORT}/api/motto" 2>/dev/null || echo "000")"
  if [[ "$code" == "200" ]]; then
    echo "OK   /api/motto -> 200"
    break
  fi
  sleep 1
done
if [[ "${code:-}" != "200" ]]; then
  echo "WARN /api/motto -> HTTP ${code:-000} (frontend image is fine; check backend container)"
fi

echo ""
echo "Production Docker build verified. Safe to commit and deploy."
