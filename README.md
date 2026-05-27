# Blue Yonder Boys

Band website — a dark, americana-styled home for fans to find shows, photos, social links, and ways to tip the band. Content is managed through a hidden `/admin` dashboard (not linked from the public site).

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Vite + React + Tailwind CSS |
| Backend | Python (FastAPI) |
| Database | SQLite3 (SQLAlchemy) |
| Deploy | Docker + Docker Compose |

## Requirements

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2
- For local development without Docker: Node.js 20+, Python 3.12+

## First-time setup

**Run `install.sh` once before anything else.** It creates `.env` (admin credentials + JWT secret) and required directories.

```bash
chmod +x install.sh applyUpdate.sh
./install.sh
```

Then start or update the stack:

```bash
./applyUpdate.sh
```

The site is served on port `8080` by default (`APP_PORT` in `.env`).

### What `install.sh` does

- Generates a cryptographically secure `JWT_SECRET`
- Prompts for admin username and password
- Writes `.env` (gitignored)
- Creates `backend/database/uploads/` for photo storage
- Asks before overwriting an existing `.env`

### What `applyUpdate.sh` does

- Runs backend and frontend unit tests (`scripts/run-tests.sh`) — deploy stops if any test fails
- Builds new Docker images **while containers are still running**
- Runs `docker compose up -d` to swap to the new images (avoids `down && build && up`)
- Optional: `./applyUpdate.sh --pull` to `git pull` first

## Data persistence

| Data | Location |
|------|----------|
| SQLite DB | `backend/database/blueyonderboys.db` |
| Uploaded photos | `backend/database/uploads/` |

These paths are bind-mounted into the backend container. They survive image rebuilds and `docker compose up/down`. **Do not** run `docker compose down -v` unless you intend to delete volumes.

Backup example:

```bash
cp -a backend/database/blueyonderboys.db ~/backup/byb-db-$(date +%F).db
tar czf ~/backup/byb-uploads-$(date +%F).tgz -C backend/database/uploads .
```

## Admin

Open **`/admin`** directly in the browser (there is no link in the public navigation). Sign in with the credentials from `install.sh`.

Manage:

- Band motto (hero tagline) and bio
- Photo gallery (upload / delete)
- Upcoming shows
- Social / tip link URLs

## Tests

Run backend and frontend unit tests locally:

```bash
./scripts/run-tests.sh
```

`applyUpdate.sh` runs the same suite before building images; deploy aborts if anything fails.

### npm / Docker on a production server

`package-lock.json` must resolve packages from **https://registry.npmjs.org/** (not a corporate registry). If the lockfile contains URLs your server cannot reach, `npm ci` may finish without installing `vite`, and the image build fails with `Cannot find module '.../vite.js'`.

Regenerate the lockfile from the public registry if needed:

```bash
cd frontend
rm -rf node_modules package-lock.json
NPM_CONFIG_REGISTRY=https://registry.npmjs.org/ npm install
```

Do **not** use `npm ci --omit=dev` in the frontend `Dockerfile` — the build needs `vite` and related tooling.

### Verify production Docker build (before commit/deploy)

Reproduces the server failure mode (`NODE_ENV=production`, production `npm ci` on the host) then builds the frontend image with no cache:

```bash
./scripts/verify-docker-build.sh
```

You should see `vite v6.x.x building for production...` in the output and `OK: vite build ran inside Docker`. Then open **http://localhost:8082** (the frontend publish port in `docker-compose.yml`).

## Local development

### Docker backend + Vite frontend (recommended hybrid)

Use this when you want the API in Docker but hot-reload on the React app.

```bash
# Terminal 1 — from repo root (requires .env from install.sh)
docker compose up backend
```

The backend is published on **http://localhost:8000** (`API_PORT` in `.env`, default `8000`). Earlier compose files only used `expose`, which is **not** reachable from the host — `ports` is required for `npm run dev` to proxy API calls.

```bash
# Terminal 2
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. Vite proxies `/api` to `http://127.0.0.1:8000`.

Quick check:

```bash
curl http://127.0.0.1:8000/api/bio
```

### Backend without Docker

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export $(grep -v '^#' ../.env | xargs)
export DATABASE_DIR="$(pwd)/database"
uvicorn app.main:app --reload --port 8000
```

### Frontend without Docker

Same as above: `cd frontend && npm run dev` with the backend on port 8000.

## API overview

| Method | Route | Auth |
|--------|-------|------|
| GET | `/api/bio` | Public |
| PUT | `/api/bio` | Admin |
| GET | `/api/motto` | Public |
| PUT | `/api/motto` | Admin |
| GET | `/api/shows` | Public |
| POST | `/api/shows` | Admin |
| PUT | `/api/shows/{id}` | Admin |
| DELETE | `/api/shows/{id}` | Admin |
| GET | `/api/links` | Public |
| PUT | `/api/links/{id}` | Admin |
| GET | `/api/photos` | Public |
| POST | `/api/photos` | Admin |
| DELETE | `/api/photos/{id}` | Admin |
| POST | `/api/auth/login` | Public |

Public pages are read-only — no forms or user submissions on the main site.

## Environment variables

Created by `install.sh`:

```
ADMIN_USERNAME=
ADMIN_PASSWORD=
JWT_SECRET=
APP_PORT=8080
API_PORT=8000
```
