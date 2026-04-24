# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**VibeBoard** — SaaS-платформа для управления задачами (kanban) с акцентом на продуктивность: встроенный Pomodoro-таймер, time tracking, аналитика и командные workspace. Монетизация по freemium-модели через Stripe.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Tailwind CSS (SPA) |
| Backend | Python + FastAPI (async REST API) |
| Database | PostgreSQL |
| Cache / Queue | Redis + Celery |
| Payments | Stripe |
| Infra | Docker, CI/CD |

## Architecture

Клиент-серверная модель. Frontend и backend — полностью разделены.

```
VibeBoard/
├── frontend/           # React SPA
├── backend/            # FastAPI API server
├── CLAUDE.md           # этот файл — загружается всегда
├── frontend/CLAUDE.md  # frontend-правила — загружается лениво
├── backend/CLAUDE.md   # backend-правила — загружается лениво
├── TZ.md               # Техническое задание
└── .claude/
    ├── rules/          # правила стиля, тестирования, безопасности
    └── skills/         # скиллы проекта (единственное место — НЕ .agents/)
        ├── supabase                      # работа с Supabase MCP
        ├── supabase-postgres-best-practices  # оптимизация Postgres
        ├── deploy                        # деплой
        ├── db-migrate                    # миграции БД
        └── test-all                      # запуск тестов
```

**Скиллы хранятся только в `.claude/skills/`** — папка `.agents/` не используется и не создаётся.

**Frontend** (`frontend/CLAUDE.md`) — архитектура FSD (app / pages / widgets / features / entities / shared). Все запросы инкапсулированы в API-клиенты (authApi, boardsApi, tasksApi и т.д.). Серверный и UI state разделены.

**Backend** (`backend/CLAUDE.md`) — слои: routers → services → repositories → models. Все ресурсы под префиксом `/api/v1`. JWT auth + refresh tokens. Бизнес-логика только в services, SQL только в repositories.

## Core Domain Entities

`User` → `Workspace` → `Board` → `Column` → `Task`

Дополнительно: `TimeEntry / PomodoroSession`, `Subscription`, `WorkspaceMember` (roles: owner / admin / member), `Label`, `Checklist / ChecklistItem`, `Invitation`.

## Subscription Plans & Feature Gates

| Feature | Free | Pro | Team |
|---------|------|-----|------|
| Boards | лимит | unlimited | unlimited |
| Recurring tasks | — | + | + |
| Advanced analytics | — | + | + |
| Export | — | + | + |
| Workspace collaboration | — | — | + |

**Feature gates проверяются на backend** — не полагаться только на скрытие UI.

## Key Product Flows

- **Kanban**: drag & drop колонок и карточек, оптимистичный UI, rollback при ошибке
- **Pomodoro**: активная сессия хранится на сервере, переживает ре-рендеры и обновление страницы
- **Stripe**: все операции только через backend (checkout session, billing portal, webhooks); webhook обрабатываются идемпотентно с проверкой подписи
- **Reorder**: position field для колонок и задач, атомарные обновления при перемещении

## API Conventions

- Prefix: `/api/v1`
- Auth: JWT access + refresh token
- Errors: единый формат — validation / auth / forbidden / not_found / internal
- Docs: OpenAPI автогенерация из FastAPI

## Pages

auth, onboarding, dashboard (kanban), calendar view, analytics, settings, billing, workspace (members & roles)
