# VibeBoard

SaaS kanban platform with Pomodoro timer, time tracking, and analytics.
Freemium model via Stripe. React + FastAPI + PostgreSQL.

## Quick start — Docker Compose

Requires: Docker + Docker Compose.

```bash
git clone <repo-url> && cd vibeboard
docker-compose up --build
```

| Service  | URL                              |
|----------|----------------------------------|
| Frontend | http://localhost:3000            |
| API      | http://localhost:8000/api/v1     |
| Swagger  | http://localhost:8000/api/docs   |
| Health   | http://localhost:8000/api/v1/health |

Data is persisted in a named Docker volume. To reset: `docker-compose down -v`.

---

## Local development (without Docker)

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL 15+ running locally

### Backend

```bash
cd backend

# Create and activate virtualenv
python3 -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy env file and edit as needed
cp .env.example .env

# Run migrations (if using Alembic)
alembic upgrade head

# Start dev server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

npm install

# Optional: set backend URL (defaults to http://localhost:8000/api/v1)
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env

npm run dev
# → http://localhost:5173
```

---

## Environment variables

### Backend — `backend/.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/vibeboard` | PostgreSQL connection string |
| `JWT_SECRET` | `change-me-in-production` | Secret for signing JWT tokens — **change in production** |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access token TTL |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection string |
| `CORS_ORIGINS` | `["http://localhost:5173"]` | Allowed frontend origins |
| `STRIPE_SECRET_KEY` | _(empty)_ | Stripe secret key — required for billing |
| `STRIPE_WEBHOOK_SECRET` | _(empty)_ | Stripe webhook signing secret |
| `STRIPE_PRICE_ID_PRO` | _(empty)_ | Stripe price ID for Pro plan |
| `STRIPE_PRICE_ID_TEAM` | _(empty)_ | Stripe price ID for Team plan |
| `APP_ENV` | `development` | Set to `production` to enable secret validation |

Stripe variables are optional for local development — billing endpoints will return errors if unset.

### Frontend — `frontend/.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000/api/v1` | Backend API base URL |

---

## Running tests

### Backend

```bash
cd backend
source .venv/bin/activate

# Install test dependencies (first time only)
pip install -r requirements-test.txt

pytest
```

### Frontend

```bash
cd frontend
npx vitest run

# Watch mode
npx vitest
```

---

## Project structure

```
vibeboard/
├── backend/        # FastAPI — routers → services → repositories → models
├── frontend/       # React SPA — FSD architecture (pages/widgets/features/entities/shared)
├── docker-compose.yml
└── README.md
```
