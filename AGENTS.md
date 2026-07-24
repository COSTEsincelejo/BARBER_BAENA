# AGENTS.md

## Cursor Cloud specific instructions

Baena Barber is a single full-stack app with three parts that all must run for end-to-end testing:

| Service | Dir | Dev command | Port |
|---------|-----|-------------|------|
| PostgreSQL 16 | — | `sudo pg_ctlcluster 16 main start` | 5432 |
| Backend (Express API) | `backend/` | `npm run dev` (`node --watch`) | 4000 |
| Frontend (React/Vite SPA) | `frontend/` | `npm run dev` | 5173 |

Public site is `/`, admin panel is `/admin`. Default admin login: `admin` / `baena2026`.

### Non-obvious startup notes

- **PostgreSQL is NOT auto-started.** Run `sudo pg_ctlcluster 16 main start` at the start of each session before the backend. The role `barberia` (password `barberia123`) and database `barberia_db` already exist (created during setup and persisted in the snapshot); the schema from `backend/db/schema.sql` is already loaded. To reload from scratch: `sudo -u postgres psql -d barberia_db -f backend/db/schema.sql`.
- **`.env` files** (`backend/.env`, `frontend/.env`) are gitignored, already created from the `.env.example` templates, and persisted in the snapshot. `backend/src/db.js` defaults match the local Postgres creds, so the backend also works without `.env`.
- Backend auto-creates the default admin on startup (`ensureDefaultAdmin`), logging `Admin creado: usuario="admin"` on first run.
- **No lint or test scripts exist** in either `package.json`. Only `dev`/`start` (backend) and `dev`/`build`/`preview` (frontend). Do not expect `npm test`/`npm run lint` to work.

### External integrations (no service to run)

- WhatsApp and Nequi are not real API integrations — the app only generates `wa.me` deep links and displays a Nequi phone number. No credentials or mock services are needed.

### Docker alternative

`docker compose up --build` runs all three services together, but Docker is not installed in this environment by default; the manual flow above is the working setup.
