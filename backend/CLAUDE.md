# Backend

Используй Python + FastAPI как обязательный стек backend. Реализуй backend как отдельный API-сервис с чётким разделением на routers, schemas, services, repositories, models, core, integrations, background jobs. Не смешивай HTTP-слой, бизнес-логику и доступ к базе данных в одном модуле.

Все эндпоинты должны быть REST-ориентированными, предсказуемыми и версионируемыми. Используй префикс api/v1. Соблюдай единообразие именования ресурсов и методов. Не создавай нестандартные action endpoints, если поведение можно выразить через ресурсную модель. Исключения допустимы для timer, auth callbacks, stripe webhooks и analytics aggregation.

Основная база данных — PostgreSQL. Проектируй нормализованную схему с явными внешними ключами, индексами, ограничениями уникальности и полями created_at, updated_at для ключевых сущностей. Используй отдельные таблицы для users, workspaces, workspace_members, boards, columns, tasks, task_labels, labels, checklists, checklist_items, time_entries, subscriptions, plans, stripe_customers, stripe_events, invitations, analytics_snapshots и attachments при необходимости.

Каждая сущность должна иметь явную ownership model. Board принадлежит либо personal workspace, либо team workspace. Column принадлежит board. Task принадлежит column и board. Membership определяет роль пользователя в workspace. Не допускай неявных связей без внешнего ключа.

Роли workspace должны быть явно заданы и проверяться на backend. Минимально поддерживай owner, admin, member. Проверяй права доступа для чтения, создания, редактирования, удаления досок, задач, участников и billing-настроек. Не доверяй данным роли, пришедшим с клиента. Источник истины — база данных.

Аутентификацию реализуй через JWT access token и refresh token либо эквивалентную безопасную схему. Пароли храни только в виде безопасного хеша. Не храни пароли и секреты в открытом виде. Реализуй регистрацию, login, refresh, logout, password reset flow и OAuth-подключение через отдельные провайдерные адаптеры.

Все входные и выходные данные описывай через Pydantic-схемы. Не возвращай ORM-модели напрямую. Для create, update, response и list views используй разные схемы там, где это необходимо. Валидируй email, enum-поля, UUID, даты, pagination params и billing-related поля до попадания в сервисный слой.

Бизнес-логика должна жить в services. Работа с БД должна быть инкапсулирована в repositories. Routers только принимают запрос, вызывают сервисы и возвращают response schema. Не помещай SQL-запросы в routers. Не помещай сложную бизнес-логику в Pydantic validators.

Эндпоинты должны покрывать auth, user profile, user settings, workspace CRUD, invitations, members and roles, board CRUD, column CRUD и reorder, task CRUD, task reorder и move, checklist CRUD, labels CRUD, calendar tasks feed, pomodoro sessions, time tracking, analytics, subscription status, pricing availability, Stripe checkout session creation, Stripe customer portal link и webhook handling.

Для kanban reorder реализуй сохранение порядка колонок и задач через sortable position field или аналогичный механизм. Операции перемещения должны быть атомарными. При изменении порядка пересчитывай только необходимый диапазон записей. Не делай полный reorder всей доски без причины.

Task model должна поддерживать title, description, due_date, priority, status, board_id, column_id, checklist progress, tracked_time_total, recurring_rule, created_by, updated_by, archived flag и premium-related fields. Если recurring tasks входят в платный тариф, backend должен блокировать создание таких задач на free плане.

Pomodoro и time tracking реализуй через отдельную сущность TimeEntry или PomodoroSession с полями task_id, user_id, started_at, ended_at, duration_seconds, session_type, status. Backend должен уметь создавать, завершать, отменять и агрегировать сессии. Нельзя полагаться только на вычисления на клиенте. Источник аналитики — серверные time entries.

Analytics считай на backend. Минимально поддерживай completed_tasks_count, total_tracked_time, daily_activity, streak, board/task completion summaries. Для тяжёлых агрегаций используй подготовленные запросы, materialized views, Redis caching или фоновые пересчёты. Не вычисляй всю аналитику on the fly для каждого запроса при росте данных.

Для recurring tasks проектируй модель с возможностью будущего расширения. Храни правило повторения отдельно и создавай новые экземпляры задач через фоновый процесс. Не создавай recurring duplication внутри HTTP-запроса, если это влияет на производительность.

Используй Redis для кэша, rate limiting, идемпотентности webhook-обработки и временных служебных состояний. Celery или аналог используй для фоновых задач: emails, invitation sending, recurring task generation, analytics recomputation, export generation, billing sync retries. Не выполняй длительные операции в request-response цикле.

Stripe интегрируй только через backend. Создавай checkout session, billing portal session, customer records и subscription synchronization на сервере. Храни stripe_customer_id, stripe_subscription_id, current_plan, billing_status, period_start, period_end, cancel_at_period_end и метаданные тарифа в БД. Обрабатывай webhook events идемпотентно. Проверяй подпись Stripe webhook. Не меняй статус подписки только на основании клиентского редиректа после оплаты.

Реализуй freemium-ограничения на backend как обязательную серверную логику. Free: лимит количества досок и базовый функционал. Pro: unlimited boards, advanced analytics, recurring tasks, export, premium customization access. Team: workspace collaboration, invites, roles, shared boards. Все лимиты и feature gates должны проверяться на сервере перед выполнением действия.

Для API ошибок используй единый формат ответа. Разделяй ошибки валидации, аутентификации, авторизации, бизнес-ограничений, not found и internal errors. Не возвращай сырые stack traces клиенту. Все ошибки логируй структурированно.

Документируй API через OpenAPI автоматически из FastAPI и поддерживай актуальность схем. Для внешних интеграций и webhook endpoints добавляй явные request/response contracts. Не допускай расхождения между кодом и документацией.

Используй миграции БД. Любое изменение модели данных должно сопровождаться миграцией. Не изменяй схему вручную в обход миграционного инструмента. Следи за обратимой структурой миграций там, где это возможно.

Проектируй backend как stateless application layer. Локальное файловое хранилище не использовать как основной persistent storage для SaaS-продукта. Для экспорта и вложений предусмотри совместимость с объектным хранилищем. Конфигурацию окружения держи в env variables. Секреты не храни в репозитории.

Для производительности держи отклик стандартных CRUD-операций быстрым, минимизируй N+1 запросы, индексируй внешние ключи и часто используемые фильтры, используй pagination для списков задач, досок, пользователей и time entries. Не возвращай избыточные payloads, если достаточно summary view.

Для безопасности реализуй CORS только для разрешённых frontend origins, rate limiting для auth и webhook endpoints, защиту от повторной отправки критических операций, аудит действий по billing и membership changes, безопасную обработку файлов и строгую проверку прав доступа к ресурсам. Никогда не проверяй доступ только по ID сущности без привязки к workspace/user scope.

Тесты backend должны покрывать auth, permissions, workspace roles, task CRUD, reorder logic, timer lifecycle, analytics calculations, plan restrictions, Stripe webhook processing и failure cases. Для критичных сервисов добавляй unit и integration tests. Проверяй happy path, forbidden path и edge cases.

Подготавливай backend к будущему расширению на realtime collaboration, marketplace templates, external integrations и AI-features. Не внедряй эти функции заранее в первом релизе, но не блокируй их будущую реализацию текущей архитектурой.
