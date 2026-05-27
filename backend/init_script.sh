#!/bin/bash
set -euo pipefail

mkdir -p "${DATABASE_DIR:-/app/database}/uploads"

echo "Starting Blue Yonder Boys API..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
