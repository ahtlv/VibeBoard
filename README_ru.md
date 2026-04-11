# VibeBoard

SaaS kanban-платформа с Pomodoro-таймером, тайм-трекингом и аналитикой.
Freemium-модель монетизации через Stripe. React + FastAPI + PostgreSQL.

## Быстрый старт — Docker Compose

Требования: Docker + Docker Compose.

```bash
git clone <repo-url> && cd vibeboard
docker-compose up --build
```

| Сервис   | URL                                 |
|----------|-------------------------------------|
| Frontend | http://localhost:3000               |
| API      | http://localhost:8000/api/v1        |
| Swagger  | http://localhost:8000/api/docs      |
| Health   | http://localhost:8000/api/v1/health |

Данные сохраняются в именованном Docker-volume. Сбросить: `docker-compose down -v`.

---

## Локальная разработка (без Docker)

### Требования

- Python 3.12+
- Node.js 20+
- PostgreSQL 15+ запущенный локально

### Backend

```bash
cd backend

# Создать и активировать виртуальное окружение
python3 -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate

# Установить зависимости
pip install -r requirements.txt

# Скопировать файл окружения и при необходимости отредактировать
cp .env.example .env

# Применить миграции (если используется Alembic)
alembic upgrade head

# Запустить dev-сервер
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

npm install

# Опционально: задать URL backend-а (по умолчанию http://localhost:8000/api/v1)
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env

npm run dev
# → http://localhost:5173
```

---

## Переменные окружения

### Backend — `backend/.env`

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/vibeboard` | Строка подключения к PostgreSQL |
| `JWT_SECRET` | `change-me-in-production` | Секрет для подписи JWT-токенов — **обязательно сменить в продакшне** |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Время жизни access-токена |
| `REDIS_URL` | `redis://localhost:6379/0` | Строка подключения к Redis |
| `CORS_ORIGINS` | `["http://localhost:5173"]` | Разрешённые источники запросов (frontend) |
| `STRIPE_SECRET_KEY` | _(пусто)_ | Секретный ключ Stripe — нужен для биллинга |
| `STRIPE_WEBHOOK_SECRET` | _(пусто)_ | Секрет для проверки подписи Stripe webhook |
| `STRIPE_PRICE_ID_PRO` | _(пусто)_ | ID цены Stripe для тарифа Pro |
| `STRIPE_PRICE_ID_TEAM` | _(пусто)_ | ID цены Stripe для тарифа Team |
| `APP_ENV` | `development` | Установить `production` для включения проверки секретов |

Переменные Stripe опциональны для локальной разработки — billing-эндпоинты вернут ошибку, если они не заданы.

### Frontend — `frontend/.env`

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `VITE_API_URL` | `http://localhost:8000/api/v1` | Базовый URL backend API |

---

## Запуск тестов

### Backend

```bash
cd backend
source .venv/bin/activate

# Установить тестовые зависимости (только один раз)
pip install -r requirements-test.txt

pytest
```

### Frontend

```bash
cd frontend
npx vitest run

# Режим наблюдения
npx vitest
```

---

## Структура проекта

```
vibeboard/
├── backend/        # FastAPI — routers → services → repositories → models
├── frontend/       # React SPA — FSD-архитектура (pages/widgets/features/entities/shared)
├── docker-compose.yml
└── README.md
```
