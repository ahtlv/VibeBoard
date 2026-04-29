# Project Structure Rules

Правила структуры файлов и папок. Применяются к **новым** артефактам — существующие файлы не переносятся без явного плана.

## Директории верхнего уровня

```
vibeboard/
├── frontend/          # React SPA (FSD-архитектура)
├── backend-ts/        # Hono + TypeScript (Cloudflare Workers)
├── .claude/
│   ├── rules/         # правила проекта (этот файл — здесь)
│   └── skills/        # скиллы проекта — ЕДИНСТВЕННОЕ место
├── changelog/         # CHANGELOG-YYYY-MM-DD-<тема>.md
├── databases/         # дампы схемы перед миграциями
├── docs/              # новые продуктовые документы (ТЗ, roadmap, ADR)
└── tasks/             # активные task-файлы (отдельные фичи)
```

## Скиллы — только в `.claude/skills/`

Новые скиллы добавлять исключительно в `.claude/skills/`. Папка `.agents/` — legacy, не пополнять и не использовать как источник скиллов.

## Документы продукта — в `docs/`

Новые документы (ТЗ, roadmap, ADR, исследования, спецификации) создавать в `docs/`. Существующие `tasks.md`, `tasks_done.md`, `TZ.md`, `README.md`, `README_ru.md` остаются на месте — не переносить без явного плана.

## CLAUDE.md иерархия

Три уровня, не больше:
1. `vibeboard/CLAUDE.md` — проект целиком (стек, домен, ключевые потоки).
2. `frontend/CLAUDE.md` — правила для React SPA.
3. `backend-ts/CLAUDE.md` — правила для Hono/Workers API.

Специфичные правила (стиль, тестирование, безопасность, структура) — в `.claude/rules/`, не в CLAUDE.md.

## Changelog

`changelog/CHANGELOG-YYYY-MM-DD-<тема>.md` — после каждого крупного пуша. Детали в `.claude/rules/changelog.md`.

## DB dumps

`databases/YYYY-MM-DD_before_<migration_name>.sql` — перед каждой миграцией. Детали в `.claude/rules/db-migrations.md`.

## Запрет дублирования README

Новые проекты/модули — один `README.md`. Если нужен перевод — отдельная секция в том же файле, не `README_ru.md`.
