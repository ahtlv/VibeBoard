1. Название: Создать базовую структуру frontend-проекта
   Описание: Подготовить каркас SPA-приложения VibeBoard на React + TypeScript + Tailwind CSS с базовой доменной структурой директорий.
   Требования: Создать папки app, pages, widgets, features, entities, shared. Подключить Tailwind. Настроить базовый entrypoint приложения. Добавить глобальный layout.
   Критерии: Проект запускается локально. Есть пустые директории по архитектуре. Tailwind стили применяются. На экране отображается базовый layout.
   Prompt для Claude Code: Создай базовую структуру frontend-проекта VibeBoard на React + TypeScript + Tailwind CSS. Используй папки app, pages, widgets, features, entities, shared. Подключи Tailwind, создай App.tsx, main entrypoint и простой layout с заголовком VibeBoard. Не добавляй лишнюю бизнес-логику.

2. Название: Настроить frontend-роутинг
   Описание: Добавить маршрутизацию для основных страниц приложения.
   Требования: Подключить router. Создать маршруты для login, register, onboarding, dashboard, calendar, analytics, settings, billing, workspace.
   Критерии: Переход между роутами работает. Каждая страница рендерит временный заголовок.
   Prompt для Claude Code: Подключи роутинг в frontend VibeBoard. Добавь страницы login, register, onboarding, dashboard, calendar, analytics, settings, billing, workspace. Для каждой страницы создай простой route-level компонент с временным заголовком.

3. Название: Создать базовую тему light/dark
   Описание: Добавить поддержку светлой и тёмной темы на уровне приложения.
   Требования: Реализовать theme provider. Переключение должно менять классы темы глобально. Сохранить выбор в localStorage.
   Критерии: Кнопка переключения темы работает. После перезагрузки тема сохраняется.
   Prompt для Claude Code: Реализуй в VibeBoard базовую поддержку light/dark theme. Сделай ThemeProvider, кнопку переключения и сохранение текущей темы в localStorage. Используй Tailwind и минимальную реализацию.

4. Название: Создать UI-компонент AppShell
   Описание: Подготовить общий каркас защищённых страниц с sidebar и header.
   Требования: AppShell должен содержать header, sidebar, main content. Поддерживать адаптивность.
   Критерии: Компонент можно использовать на dashboard и других внутренних страницах. Sidebar и header отображаются корректно.
   Prompt для Claude Code: Создай переиспользуемый компонент AppShell для VibeBoard. Внутри должны быть header, sidebar и main content area. Сделай адаптивную верстку на Tailwind без бизнес-логики.

5. Название: Описать frontend-типы пользователя и подписки
   Описание: Создать типы TypeScript для User, Subscription, Plan, WorkspaceRole.
   Требования: Без any. Типы должны покрывать email, id, settings, current plan, billing status, workspace role.
   Критерии: Типы вынесены в shared/types или entities. Их можно импортировать в другие модули.
   Prompt для Claude Code: Создай TypeScript-типы для сущностей User, Subscription, Plan, WorkspaceRole в проекте VibeBoard. Учитывай freemium, pro и team планы. Не используй any.

6. Название: Описать frontend-типы доски
   Описание: Создать типы для Board, Column, Task, ChecklistItem, Label, TimeEntry.
   Требования: Учесть title, description, dueDate, priority, status, checklist, tracked time, labels, column ordering.
   Критерии: Все сущности типизированы. Типы пригодны для dashboard, task modal и analytics.
   Prompt для Claude Code: Создай TypeScript-типы для Board, Column, Task, ChecklistItem, Label, TimeEntry в VibeBoard. Учитывай kanban, дедлайны, приоритеты, чеклисты и time tracking. Не используй any.

7. Название: Создать страницу login
   Описание: Реализовать UI-страницу входа по email и паролю.
   Требования: Поля email и password, кнопка submit, ссылка на регистрацию. Базовая клиентская валидация.
   Критерии: Форма рендерится. Валидация пустых полей работает. Страница готова к подключению API.
   Prompt для Claude Code: Создай страницу login для VibeBoard. Добавь поля email и password, кнопку входа, ссылку на регистрацию и простую клиентскую валидацию. Используй React + TypeScript + Tailwind.

8. Название: Создать страницу register
   Описание: Реализовать UI-страницу регистрации.
   Требования: Поля email, password, confirmPassword. Проверка совпадения паролей.
   Критерии: Форма рендерится и показывает ошибки для пустых полей и несовпадающих паролей.
   Prompt для Claude Code: Создай страницу register для VibeBoard. Добавь поля email, password, confirmPassword, кнопку регистрации и простую клиентскую валидацию, включая проверку совпадения паролей.

9. Название: Создать frontend auth store
   Описание: Подготовить клиентское состояние авторизации.
   Требования: Хранить user, access token, auth status. Добавить методы setAuth и logout.
   Критерии: Store создаётся и используется из компонентов. После logout состояние очищается.
   Prompt для Claude Code: Создай auth store для frontend VibeBoard. Храни user, accessToken и authStatus. Добавь методы setAuth и logout. Реализация должна быть простой и типизированной.

10. Название: Реализовать frontend route guard
    Описание: Добавить защиту приватных маршрутов.
    Требования: Неавторизованный пользователь должен редиректиться на login.
    Критерии: При отключённой авторизации приватные страницы недоступны.
    Prompt для Claude Code: Реализуй ProtectedRoute для VibeBoard. Если пользователь не авторизован, перенаправляй его на /login. Используй существующий auth store.

11. Название: Создать onboarding-страницу
    Описание: Подготовить экран первого входа с созданием personal workspace.
    Требования: Поле названия workspace и кнопка продолжения. Простая валидация.
    Критерии: Страница готова для интеграции с backend. UI соответствует остальным экранам.
    Prompt для Claude Code: Создай onboarding страницу VibeBoard с полем для названия первого workspace и кнопкой Continue. Добавь простую валидацию и аккуратный UI.

12. Название: Создать layout страницы dashboard
    Описание: Подготовить экран основного kanban-dashboard без логики.
    Требования: Использовать AppShell. Вывести секции board header, columns area, sidebar tools.
    Критерии: Структура готова для последующего подключения досок и колонок.
    Prompt для Claude Code: Создай layout страницы dashboard для VibeBoard. Используй AppShell. Покажи board header, область колонок и боковую панель инструментов как статические блоки.

13. Название: Создать компонент BoardHeader
    Описание: Реализовать заголовок доски с названием и кнопками действий.
    Требования: Отображать имя доски, кнопку создания колонки и кнопку создания задачи.
    Критерии: Компонент принимает props и корректно рендерится.
    Prompt для Claude Code: Создай компонент BoardHeader для VibeBoard. Он должен принимать название доски и отображать кнопки Add column и Add task. Используй TypeScript props.

14. Название: Создать компонент KanbanColumn
    Описание: Реализовать UI одной колонки kanban-доски.
    Требования: Заголовок колонки, счётчик задач, область списка карточек.
    Критерии: Компонент принимает column и список tasks. Корректно отображает данные.
    Prompt для Claude Code: Создай компонент KanbanColumn для VibeBoard. Покажи title колонки, количество задач и список карточек. Используй типы Column и Task.

15. Название: Создать компонент TaskCard
    Описание: Реализовать карточку задачи для kanban-доски.
    Требования: Отображать title, due date, priority, checklist progress, tracked time.
    Критерии: Компонент принимает task и отображает основные поля без ошибок.
    Prompt для Claude Code: Создай компонент TaskCard для VibeBoard. Отображай title, due date, priority, прогресс чеклиста и tracked time. Используй Tailwind и TypeScript.

16. Название: Создать моковые данные доски
    Описание: Подготовить временные локальные данные для канбан-экрана.
    Требования: Создать один board, три columns, несколько tasks с разными статусами и дедлайнами.
    Критерии: Dashboard рендерится на моковых данных без backend.
    Prompt для Claude Code: Создай mock data для VibeBoard dashboard: одну доску, три колонки и минимум шесть задач с разными приоритетами, дедлайнами и чеклистами. Подключи эти данные к dashboard.

17. Название: Подключить drag and drop для карточек
    Описание: Реализовать базовое перемещение задач между колонками на frontend.
    Требования: Обновлять локальное состояние после drag and drop. Пока без API.
    Критерии: Карточку можно перетащить в другую колонку. UI обновляется.
    Prompt для Claude Code: Добавь drag and drop для TaskCard между KanbanColumn в VibeBoard. Пока реализуй только локальное состояние без серверной синхронизации.

18. Название: Создать модальное окно задачи
    Описание: Реализовать modal для просмотра и редактирования карточки задачи.
    Требования: Поля title, description, due date, priority. Кнопка закрытия.
    Критерии: При открытии показываются данные задачи. Модалка закрывается корректно.
    Prompt для Claude Code: Создай TaskModal для VibeBoard. Покажи поля title, description, due date и priority. Добавь кнопку закрытия и поддержку передачи task через props.

19. Название: Добавить чеклист в модалку задачи
    Описание: Расширить TaskModal поддержкой checklist.
    Требования: Показ списка пунктов и чекбоксов. Подсчёт выполненных пунктов.
    Критерии: В модалке чеклист отображается и локально переключается.
    Prompt для Claude Code: Расширь TaskModal в VibeBoard: добавь отображение checklist с чекбоксами и подсчётом выполненных пунктов. Пока храни изменения локально.

20. Название: Добавить UI Pomodoro-таймера в задачу
    Описание: Подготовить визуальный блок таймера в карточке или модалке задачи.
    Требования: Кнопки start, pause, stop. Отображение текущего времени.
    Критерии: Таймер запускается и останавливается локально.
    Prompt для Claude Code: Добавь в TaskModal VibeBoard UI-блок Pomodoro timer с кнопками Start, Pause, Stop и отображением текущего времени. Реализуй локальную работу таймера.

21. Название: Создать страницу Calendar
    Описание: Реализовать базовый экран календарного представления задач.
    Требования: Показывать список задач по дедлайнам. Можно в виде grouped list по датам.
    Критерии: Страница отображает задачи, сгруппированные по due date.
    Prompt для Claude Code: Создай базовую страницу Calendar для VibeBoard. Пока без полноценной сетки календаря — достаточно сгруппировать задачи по due date и отобразить список по датам.

22. Название: Создать страницу Analytics
    Описание: Подготовить экран аналитики продуктивности.
    Требования: Отобразить карточки completed tasks, tracked time, streak, pomodoro sessions.
    Критерии: Страница готова для подключения реальных метрик.
    Prompt для Claude Code: Создай страницу Analytics для VibeBoard. Добавь четыре статистические карточки: completed tasks, tracked time, streak, pomodoro sessions. Пока используй mock values.

23. Название: Создать страницу Settings
    Описание: Реализовать UI пользовательских настроек.
    Требования: Блок профиля, блок темы, блок уведомлений-заглушек.
    Критерии: Страница отображается и содержит базовые настройки.
    Prompt для Claude Code: Создай страницу Settings для VibeBoard. Добавь секции Profile, Theme и Notifications. В Theme подключи переключение light/dark.

24. Название: Создать страницу Billing
    Описание: Подготовить UI управления подпиской.
    Требования: Показать current plan, список тарифов, кнопки upgrade и manage billing.
    Критерии: Страница визуально готова к интеграции со Stripe.
    Prompt для Claude Code: Создай страницу Billing для VibeBoard. Покажи текущий тариф, карточки Free, Pro и Team, а также кнопки Upgrade и Manage billing. Пока без реальных запросов.

25. Название: Создать страницу Workspace
    Описание: Подготовить экран управления участниками workspace.
    Требования: Таблица участников, роли, кнопка Invite member.
    Критерии: Страница отображает моковый список участников.
    Prompt для Claude Code: Создай страницу Workspace для VibeBoard. Добавь список участников с именем, email и ролью, а также кнопку Invite member. Используй mock data.

26. Название: Создать API-клиент frontend
    Описание: Подготовить общий слой HTTP-запросов.
    Требования: Создать api client с base URL, JSON headers и обработкой ошибок.
    Критерии: Модуль готов для импорта в authApi и другие сервисы.
    Prompt для Claude Code: Создай общий api client для frontend VibeBoard. Добавь base URL, стандартные JSON headers и простую обработку ошибок. Сделай модуль пригодным для повторного использования.

27. Название: Создать authApi на frontend
    Описание: Подготовить методы login, register, me, refresh.
    Требования: Использовать общий api client. Возвращать типизированные ответы.
    Критерии: Модуль компилируется и готов к интеграции.
    Prompt для Claude Code: Создай модуль authApi для VibeBoard frontend. Добавь методы login, register, getMe и refreshToken. Используй типизированные DTO и общий api client.

28. Название: Создать boardsApi на frontend
    Описание: Подготовить методы для загрузки и создания досок.
    Требования: Методы listBoards, getBoard, createBoard.
    Критерии: Модуль готов к использованию в dashboard.
    Prompt для Claude Code: Создай boardsApi для frontend VibeBoard. Добавь методы listBoards, getBoard и createBoard. Используй общий api client и TypeScript-типы.

29. Название: Создать tasksApi на frontend
    Описание: Подготовить методы CRUD для задач.
    Требования: Методы createTask, updateTask, deleteTask, moveTask.
    Критерии: Модуль готов к интеграции с kanban и task modal.
    Prompt для Claude Code: Создай tasksApi для frontend VibeBoard. Добавь методы createTask, updateTask, deleteTask и moveTask. Используй типизированные payloads.

30. Название: Создать analyticsApi на frontend
    Описание: Подготовить методы получения данных аналитики.
    Требования: Методы getOverview и getProductivityStats.
    Критерии: Модуль компилируется и пригоден для Analytics page.
    Prompt для Claude Code: Создай analyticsApi для frontend VibeBoard. Добавь методы getOverview и getProductivityStats. Используй общий api client и типизированные ответы.

31. Название: Создать billingApi на frontend
    Описание: Подготовить методы работы с подпиской.
    Требования: Методы getSubscription, createCheckoutSession, getBillingPortalUrl.
    Критерии: Модуль готов к подключению Billing page.
    Prompt для Claude Code: Создай billingApi для frontend VibeBoard. Добавь методы getSubscription, createCheckoutSession и getBillingPortalUrl. Используй общий api client.

32. Название: Создать backend-структуру проекта
    Описание: Подготовить каркас FastAPI-проекта по слоям.
    Требования: Создать директории routers, schemas, services, repositories, models, core, integrations.
    Критерии: Приложение стартует, есть health endpoint.
    Prompt для Claude Code: Создай базовую структуру backend-проекта VibeBoard на FastAPI. Добавь папки routers, schemas, services, repositories, models, core, integrations. Создай main.py и health endpoint.

33. Название: Настроить backend-конфигурацию через env
    Описание: Добавить settings для переменных окружения.
    Требования: Поддержать DATABASE_URL, JWT_SECRET, STRIPE_SECRET_KEY, REDIS_URL.
    Критерии: Конфиг загружается из env и используется приложением.
    Prompt для Claude Code: Добавь в backend VibeBoard конфигурацию через env variables. Поддержи DATABASE_URL, JWT_SECRET, STRIPE_SECRET_KEY и REDIS_URL через Pydantic settings или аналогичный подход.

34. Название: Подключить SQLAlchemy и session factory
    Описание: Настроить подключение к PostgreSQL.
    Требования: Создать engine, session factory, base model.
    Критерии: Приложение может получить DB session через dependency.
    Prompt для Claude Code: Настрой в backend VibeBoard SQLAlchemy для PostgreSQL. Создай engine, SessionLocal, Base и dependency для получения DB session в FastAPI.

35. Название: Создать модель User
    Описание: Описать ORM-модель пользователя.
    Требования: Поля id, email, password_hash, created_at, updated_at.
    Критерии: Модель импортируется без ошибок и готова к миграциям.
    Prompt для Claude Code: Создай SQLAlchemy-модель User для VibeBoard backend. Добавь id, email, password_hash, created_at и updated_at. Используй PostgreSQL-friendly типы.

36. Название: Создать модель Workspace
    Описание: Описать ORM-модель рабочего пространства.
    Требования: Поля id, name, owner_id, created_at, updated_at.
    Критерии: Есть связь с User.
    Prompt для Claude Code: Создай SQLAlchemy-модель Workspace для VibeBoard. Добавь id, name, owner_id, created_at, updated_at и связь с User.

37. Название: Создать модель WorkspaceMember
    Описание: Описать модель связи пользователя и workspace с ролью.
    Требования: Поля workspace_id, user_id, role.
    Критерии: Заданы внешние ключи и уникальность пары workspace_id + user_id.
    Prompt для Claude Code: Создай SQLAlchemy-модель WorkspaceMember для VibeBoard. Добавь workspace_id, user_id и role. Настрой foreign keys и unique constraint на пару workspace_id и user_id.

38. Название: Создать модель Board
    Описание: Описать модель доски.
    Требования: Поля id, name, workspace_id, created_by, created_at, updated_at.
    Критерии: Есть связь с Workspace.
    Prompt для Claude Code: Создай SQLAlchemy-модель Board для VibeBoard. Добавь id, name, workspace_id, created_by, created_at и updated_at. Настрой связи.

39. Название: Создать модель Column
    Описание: Описать модель колонки канбан-доски.
    Требования: Поля id, title, board_id, position.
    Критерии: Есть связь с Board.
    Prompt для Claude Code: Создай SQLAlchemy-модель Column для VibeBoard. Добавь id, title, board_id и position. Настрой связь с Board.

40. Название: Создать модель Task
    Описание: Описать модель задачи.
    Требования: Поля id, title, description, due_date, priority, status, board_id, column_id, position, tracked_time_total.
    Критерии: Модель покрывает базовые требования карточки задачи.
    Prompt для Claude Code: Создай SQLAlchemy-модель Task для VibeBoard. Добавь id, title, description, due_date, priority, status, board_id, column_id, position и tracked_time_total. Настрой связи с Board и Column.

41. Название: Создать модель ChecklistItem
    Описание: Описать модель элемента чеклиста задачи.
    Требования: Поля id, task_id, text, is_completed, position.
    Критерии: Есть связь с Task.
    Prompt для Claude Code: Создай SQLAlchemy-модель ChecklistItem для VibeBoard. Добавь id, task_id, text, is_completed и position. Настрой foreign key и relationship.

42. Название: Создать модель TimeEntry
    Описание: Описать модель записи времени по задаче.
    Требования: Поля id, task_id, user_id, started_at, ended_at, duration_seconds, status.
    Критерии: Модель пригодна для Pomodoro и time tracking.
    Prompt для Claude Code: Создай SQLAlchemy-модель TimeEntry для VibeBoard. Добавь id, task_id, user_id, started_at, ended_at, duration_seconds и status. Настрой связи.

43. Название: Создать модель Subscription
    Описание: Описать модель подписки пользователя или workspace.
    Требования: Поля id, user_id или workspace_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_end.
    Критерии: Модель покрывает billing и freemium.
    Prompt для Claude Code: Создай SQLAlchemy-модель Subscription для VibeBoard. Добавь поля для плана, статуса, stripe_customer_id, stripe_subscription_id и current_period_end. Учти привязку к user или workspace.

44. Название: Создать Pydantic-схемы auth
    Описание: Подготовить схемы запросов и ответов для авторизации.
    Требования: RegisterRequest, LoginRequest, TokenResponse, UserResponse.
    Критерии: Схемы валидны и импортируются без ошибок.
    Prompt для Claude Code: Создай Pydantic-схемы для auth в backend VibeBoard: RegisterRequest, LoginRequest, TokenResponse и UserResponse. Добавь базовую валидацию email и обязательных полей.

45. Название: Создать Pydantic-схемы доски
    Описание: Подготовить схемы BoardCreate, BoardResponse, ColumnResponse, TaskResponse.
    Требования: Поля должны соответствовать ORM-моделям.
    Критерии: Схемы готовы для API-слоя.
    Prompt для Claude Code: Создай Pydantic-схемы для Board, Column и Task в backend VibeBoard. Нужны минимум BoardCreate, BoardResponse, ColumnResponse и TaskResponse.

46. Название: Реализовать password hashing utility
    Описание: Добавить хеширование и проверку паролей.
    Требования: Функции hash_password и verify_password.
    Критерии: Ютилита готова к использованию в auth service.
    Prompt для Claude Code: Добавь в backend VibeBoard utility для password hashing. Нужны функции hash_password и verify_password с безопасной реализацией.

47. Название: Реализовать JWT utility
    Описание: Добавить генерацию и проверку access token.
    Требования: Функции create_access_token и decode_access_token.
    Критерии: Токен содержит user id и срок действия.
    Prompt для Claude Code: Добавь JWT utility в backend VibeBoard. Реализуй create_access_token и decode_access_token. Токен должен содержать user id и expiration.

48. Название: Создать UserRepository
    Описание: Подготовить репозиторий для работы с пользователями.
    Требования: Методы get_by_email, get_by_id, create.
    Критерии: Репозиторий использует SQLAlchemy session и компилируется без ошибок.
    Prompt для Claude Code: Создай UserRepository для backend VibeBoard. Добавь методы get_by_email, get_by_id и create. Используй SQLAlchemy session.

49. Название: Реализовать AuthService.register
    Описание: Добавить сервис регистрации пользователя.
    Требования: Проверка уникальности email, хеширование пароля, создание пользователя.
    Критерии: Сервис возвращает созданного пользователя или ошибку при дублировании email.
    Prompt для Claude Code: Реализуй AuthService.register в backend VibeBoard. Проверяй уникальность email, хешируй пароль и сохраняй пользователя через UserRepository.

50. Название: Реализовать AuthService.login
    Описание: Добавить сервис входа пользователя.
    Требования: Проверка email и пароля, генерация access token.
    Критерии: При корректных данных возвращается токен и пользователь.
    Prompt для Claude Code: Реализуй AuthService.login для backend VibeBoard. Проверь email и пароль, сгенерируй JWT access token и верни пользователя с токеном.

51. Название: Создать auth router register
    Описание: Добавить endpoint регистрации.
    Требования: POST /api/v1/auth/register. Использовать AuthService.register.
    Критерии: Эндпоинт возвращает корректный response schema.
    Prompt для Claude Code: Создай endpoint POST /api/v1/auth/register в backend VibeBoard. Используй AuthService.register и соответствующие Pydantic-схемы.

52. Название: Создать auth router login
    Описание: Добавить endpoint входа.
    Требования: POST /api/v1/auth/login. Использовать AuthService.login.
    Критерии: Эндпоинт отдаёт токен и пользователя.
    Prompt для Claude Code: Создай endpoint POST /api/v1/auth/login в backend VibeBoard. Используй AuthService.login и верни TokenResponse.

53. Название: Реализовать dependency current user
    Описание: Добавить зависимость для получения текущего пользователя из JWT.
    Требования: Извлекать токен из Authorization header. Загружать пользователя из базы.
    Критерии: Зависимость готова для защищённых endpoints.
    Prompt для Claude Code: Добавь dependency get_current_user для backend VibeBoard. Извлекай JWT из Authorization header, декодируй его и загружай пользователя из базы.

54. Название: Создать WorkspaceRepository.create
    Описание: Подготовить метод создания workspace.
    Требования: Создание workspace и owner membership.
    Критерии: После вызова создаются две связанные записи.
    Prompt для Claude Code: Добавь в backend VibeBoard логику создания workspace с owner membership. Реализуй репозиторий или сервис, который создаёт Workspace и WorkspaceMember с ролью owner.

55. Название: Создать endpoint создания workspace
    Описание: Добавить API для создания первого workspace.
    Требования: POST /api/v1/workspaces, только для авторизованного пользователя.
    Критерии: Возвращает созданный workspace.
    Prompt для Claude Code: Создай endpoint POST /api/v1/workspaces в backend VibeBoard. Только для авторизованного пользователя. При создании автоматически добавляй owner membership.

56. Название: Создать BoardRepository.create
    Описание: Подготовить создание доски.
    Требования: Метод create(name, workspace_id, created_by).
    Критерии: Возвращает созданную доску.
    Prompt для Claude Code: Создай BoardRepository с методом create для backend VibeBoard. Метод должен создавать доску в указанном workspace.

57. Название: Создать endpoint создания доски
    Описание: Добавить API создания board.
    Требования: POST /api/v1/boards. Проверка доступа к workspace.
    Критерии: Авторизованный пользователь с доступом может создать board.
    Prompt для Claude Code: Создай endpoint POST /api/v1/boards для backend VibeBoard. Проверь, что текущий пользователь состоит в workspace, и создай board.

58. Название: Создать endpoint списка досок
    Описание: Добавить API получения досок workspace.
    Требования: GET /api/v1/boards?workspace_id=. Проверка membership.
    Критерии: Возвращается список досок только доступного workspace.
    Prompt для Claude Code: Создай endpoint GET /api/v1/boards с фильтром workspace_id для backend VibeBoard. Возвращай только доски workspace, к которому у текущего пользователя есть доступ.

59. Название: Создать ColumnRepository.create
    Описание: Подготовить создание колонки для доски.
    Требования: Устанавливать position в конец списка.
    Критерии: Новая колонка создаётся с корректным position.
    Prompt для Claude Code: Создай ColumnRepository.create для backend VibeBoard. При создании новой колонки автоматически ставь её в конец по position внутри board.

60. Название: Создать endpoint создания колонки
    Описание: Добавить API создания колонки.
    Требования: POST /api/v1/columns. Проверять доступ к board.
    Критерии: Колонка создаётся и возвращается клиенту.
    Prompt для Claude Code: Создай endpoint POST /api/v1/columns для backend VibeBoard. Проверь доступ к board и создай новую колонку с position в конце.

61. Название: Создать TaskRepository.create
    Описание: Подготовить метод создания задачи.
    Требования: Устанавливать position в конец выбранной колонки.
    Критерии: Новая задача создаётся с корректным position.
    Prompt для Claude Code: Создай TaskRepository.create для backend VibeBoard. При создании задачи автоматически рассчитывай position в конце указанной колонки.

62. Название: Создать endpoint создания задачи
    Описание: Добавить API создания task.
    Требования: POST /api/v1/tasks. Проверять доступ к board и column.
    Критерии: Задача создаётся и возвращается по response schema.
    Prompt для Claude Code: Создай endpoint POST /api/v1/tasks для backend VibeBoard. Проверь доступ к board и column, затем создай задачу.

63. Название: Создать endpoint обновления задачи
    Описание: Добавить API редактирования task.
    Требования: PATCH /api/v1/tasks/{task_id}. Поддержать title, description, due_date, priority, status.
    Критерии: Частичное обновление работает корректно.
    Prompt для Claude Code: Создай endpoint PATCH /api/v1/tasks/{task_id} для backend VibeBoard. Поддержи частичное обновление title, description, due_date, priority и status.

64. Название: Создать endpoint удаления задачи
    Описание: Добавить API удаления task.
    Требования: DELETE /api/v1/tasks/{task_id}. Проверка доступа.
    Критерии: Задача удаляется, клиент получает успешный ответ.
    Prompt для Claude Code: Создай endpoint DELETE /api/v1/tasks/{task_id} для backend VibeBoard. Проверь доступ текущего пользователя и удали задачу.

65. Название: Создать endpoint перемещения задачи
    Описание: Добавить API moveTask между колонками.
    Требования: PATCH /api/v1/tasks/{task_id}/move. Принимать target_column_id и target_position.
    Критерии: column_id и position обновляются корректно.
    Prompt для Claude Code: Создай endpoint PATCH /api/v1/tasks/{task_id}/move для backend VibeBoard. Принимай target_column_id и target_position, обновляй column_id и position задачи.

66. Название: Создать endpoint checklist items
    Описание: Добавить API создания пункта чеклиста.
    Требования: POST /api/v1/tasks/{task_id}/checklist-items.
    Критерии: Новый checklist item сохраняется и возвращается.
    Prompt для Claude Code: Создай endpoint POST /api/v1/tasks/{task_id}/checklist-items в backend VibeBoard. Добавляй пункт чеклиста к задаче и возвращай его.

67. Название: Создать endpoint toggle checklist item
    Описание: Добавить API переключения статуса пункта чеклиста.
    Требования: PATCH /api/v1/checklist-items/{item_id}.
    Критерии: Поле is_completed обновляется.
    Prompt для Claude Code: Создай endpoint PATCH /api/v1/checklist-items/{item_id} в backend VibeBoard для обновления поля is_completed у checklist item.

68. Название: Создать endpoint запуска time entry
    Описание: Добавить API начала Pomodoro-сессии.
    Требования: POST /api/v1/time-entries/start. Передавать task_id.
    Критерии: Создаётся активная запись времени.
    Prompt для Claude Code: Создай endpoint POST /api/v1/time-entries/start для backend VibeBoard. Принимай task_id и создавай активную запись времени с started_at и status active.

69. Название: Создать endpoint остановки time entry
    Описание: Добавить API завершения Pomodoro-сессии.
    Требования: POST /api/v1/time-entries/stop. Передавать time_entry_id.
    Критерии: Заполняются ended_at и duration_seconds.
    Prompt для Claude Code: Создай endpoint POST /api/v1/time-entries/stop для backend VibeBoard. Завершай активную запись времени, заполняй ended_at и duration_seconds.

70. Название: Создать endpoint аналитики overview
    Описание: Добавить API базовой аналитики пользователя.
    Требования: Вернуть completed_tasks_count, total_tracked_time, streak.
    Критерии: Endpoint отдаёт корректную схему ответа.
    Prompt для Claude Code: Создай endpoint GET /api/v1/analytics/overview для backend VibeBoard. Верни базовые метрики пользователя: completed_tasks_count, total_tracked_time и streak.

71. Название: Создать страницу frontend интеграции login
    Описание: Подключить UI login к authApi.
    Требования: При успешном входе сохранять auth state и редиректить на dashboard.
    Критерии: Login flow работает с backend.
    Prompt для Claude Code: Подключи login страницу VibeBoard к authApi. При успешном входе сохраняй auth state и перенаправляй пользователя на /dashboard.

72. Название: Создать страницу frontend интеграции register
    Описание: Подключить UI register к authApi.
    Требования: После регистрации перенаправлять на onboarding или login.
    Критерии: Register flow работает.
    Prompt для Claude Code: Подключи страницу register VibeBoard к authApi. После успешной регистрации перенаправляй пользователя на onboarding или login.

73. Название: Подключить dashboard к boardsApi
    Описание: Заменить mock board на реальные данные.
    Требования: Загрузить доски пользователя и активную доску.
    Критерии: Dashboard показывает данные с backend.
    Prompt для Claude Code: Подключи dashboard VibeBoard к boardsApi. Загружай список досок и отображай активную доску вместо mock data.

74. Название: Подключить создание задачи к tasksApi
    Описание: Интегрировать форму создания task с backend.
    Требования: После успешного создания обновлять UI без полной перезагрузки.
    Критерии: Новая задача появляется в колонке.
    Prompt для Claude Code: Подключи создание задачи в dashboard VibeBoard к tasksApi. После успешного запроса добавляй новую задачу в UI без полной перезагрузки страницы.

75. Название: Подключить moveTask к backend
    Описание: Синхронизировать drag and drop с сервером.
    Требования: Делать optimistic update и rollback при ошибке.
    Критерии: После перемещения задача обновляется и в UI, и на backend.
    Prompt для Claude Code: Подключи drag and drop задач в VibeBoard к tasksApi.moveTask. Сделай optimistic update и rollback при ошибке запроса.

76. Название: Подключить таймер к time entries API
    Описание: Интегрировать frontend Pomodoro с backend.
    Требования: Start вызывает start endpoint, stop вызывает stop endpoint.
    Критерии: Сессии времени создаются на сервере.
    Prompt для Claude Code: Подключи Pomodoro timer в TaskModal VibeBoard к backend API time entries. Кнопка Start должна создавать time entry, Stop — завершать его.

77. Название: Подключить Analytics page к analyticsApi
    Описание: Заменить mock analytics на реальные данные.
    Требования: Загружать данные при открытии страницы.
    Критерии: Метрики отображаются из API.
    Prompt для Claude Code: Подключи страницу Analytics VibeBoard к analyticsApi. Загружай overview-метрики с backend и отображай их вместо mock values.

78. Название: Создать backend endpoint subscription status
    Описание: Добавить API получения текущей подписки.
    Требования: GET /api/v1/billing/subscription.
    Критерии: Возвращает current plan и billing status.
    Prompt для Claude Code: Создай endpoint GET /api/v1/billing/subscription для backend VibeBoard. Верни текущий план и billing status пользователя или workspace.

79. Название: Создать backend endpoint Stripe checkout session
    Описание: Добавить API создания checkout session.
    Требования: POST /api/v1/billing/checkout-session. Принимать plan.
    Критерии: Возвращает URL или session id.
    Prompt для Claude Code: Создай endpoint POST /api/v1/billing/checkout-session для backend VibeBoard. Принимай plan и создавай Stripe checkout session. Верни URL или session id.

80. Название: Создать backend endpoint Stripe webhook
    Описание: Добавить обработчик webhook-событий Stripe.
    Требования: POST /api/v1/billing/webhook. Проверять signature.
    Критерии: Обработчик принимает событие и обновляет subscription status.
    Prompt для Claude Code: Создай endpoint POST /api/v1/billing/webhook для backend VibeBoard. Проверяй подпись Stripe webhook и обновляй статус подписки в базе.

81. Название: Подключить Billing page к billingApi
    Описание: Интегрировать страницу billing с backend.
    Требования: Загружать текущий план, вызывать checkout.
    Критерии: Кнопка upgrade инициирует checkout flow.
    Prompt для Claude Code: Подключи страницу Billing VibeBoard к billingApi. Загружай текущую подписку и запускай checkout flow по кнопке Upgrade.

82. Название: Добавить backend-проверку лимита досок free плана
    Описание: Ограничить количество boards для бесплатного тарифа.
    Требования: Проверка должна происходить при создании новой доски.
    Критерии: Free user получает business error при превышении лимита.
    Prompt для Claude Code: Добавь в backend VibeBoard серверную проверку лимита досок для free плана. Ограничение должно срабатывать в endpoint создания board.

83. Название: Добавить backend-проверку recurring tasks только для платных планов
    Описание: Ограничить создание recurring tasks для free.
    Требования: Проверка должна быть в task create/update service.
    Критерии: На free плане recurring rule запрещён.
    Prompt для Claude Code: Добавь в backend VibeBoard проверку, что recurring tasks доступны только для платных планов. Блокируй create/update задачи с recurring_rule на free тарифе.

84. Название: Добавить frontend-индикатор ограничений free плана
    Описание: Показать пользователю причины недоступности premium-функций.
    Требования: Для premium features отображать badge или CTA на upgrade.
    Критерии: Пользователь видит ограничение прямо в интерфейсе.
    Prompt для Claude Code: Добавь во frontend VibeBoard индикаторы premium restrictions. Для recurring tasks, advanced analytics и premium themes покажи upgrade CTA вместо молчаливого скрытия.

85. Название: Создать backend endpoint приглашения участника
    Описание: Добавить API invite member в workspace.
    Требования: POST /api/v1/workspaces/{id}/invite. Принимать email и role.
    Критерии: Создаётся приглашение или заглушка приглашения.
    Prompt для Claude Code: Создай endpoint POST /api/v1/workspaces/{workspace_id}/invite для backend VibeBoard. Принимай email и role, проверяй права owner/admin и создавай запись приглашения.

86. Название: Подключить Invite member на frontend
    Описание: Интегрировать форму приглашения в Workspace page.
    Требования: Поля email и role. Вызов backend endpoint.
    Критерии: После отправки показывается успешное уведомление.
    Prompt для Claude Code: Подключи форму Invite member в Workspace page VibeBoard к backend endpoint приглашения. После успешной отправки покажи success notification.

87. Название: Добавить единый backend-формат ошибок
    Описание: Подготовить централизованный error response.
    Требования: Единая структура code, message, details.
    Критерии: Ошибки валидации и бизнес-ошибки возвращаются в одном формате.
    Prompt для Claude Code: Добавь в backend VibeBoard единый формат API ошибок с полями code, message и details. Подключи его к основным исключениям FastAPI.

88. Название: Добавить frontend toast notifications
    Описание: Подготовить систему уведомлений.
    Требования: Поддержка success и error сообщений.
    Критерии: Login, create task и ошибки API могут показывать уведомления.
    Prompt для Claude Code: Добавь в frontend VibeBoard простую систему toast notifications. Поддержи success и error уведомления и покажи пример интеграции с login и create task.

89. Название: Добавить backend pagination для списка досок
    Описание: Подготовить пагинацию в list endpoints.
    Требования: Поддержать limit и offset в GET /boards.
    Критерии: Endpoint принимает параметры и возвращает ограниченный список.
    Prompt для Claude Code: Добавь pagination в endpoint списка досок backend VibeBoard. Поддержи limit и offset и верни корректный ограниченный набор данных.

90. Название: Добавить базовые frontend loading states
    Описание: Подготовить UI-состояния загрузки.
    Требования: Для dashboard, analytics и billing показать skeleton или loading text.
    Критерии: Во время запроса пользователь видит понятное состояние.
    Prompt для Claude Code: Добавь базовые loading states во frontend VibeBoard для dashboard, analytics и billing. Используй простые skeleton или loading placeholders.

91. Название: Добавить базовые frontend empty states
    Описание: Подготовить UI для пустых данных.
    Требования: Пустая доска, нет задач, нет участников.
    Критерии: Empty state помогает пользователю понять следующий шаг.
    Prompt для Claude Code: Добавь empty states во frontend VibeBoard для пустой доски, отсутствия задач в календаре и пустого списка участников workspace.

92. Название: Создать backend healthcheck для БД
    Описание: Расширить health endpoint проверкой доступности базы.
    Требования: Выполнять простой запрос к PostgreSQL.
    Критерии: Endpoint показывает статус app и database.
    Prompt для Claude Code: Расширь backend health endpoint в VibeBoard. Добавь проверку доступности PostgreSQL и возвращай статус app и database.

93. Название: Добавить Dockerfile для backend
    Описание: Подготовить контейнеризацию backend-сервиса.
    Требования: Dockerfile должен собирать FastAPI-приложение.
    Критерии: Контейнер стартует локально.
    Prompt для Claude Code: Создай Dockerfile для backend VibeBoard на FastAPI. Сделай минимальную рабочую конфигурацию для локального запуска в контейнере.

94. Название: Добавить Dockerfile для frontend
    Описание: Подготовить контейнеризацию frontend-приложения.
    Требования: Dockerfile должен собирать React-приложение.
    Критерии: Контейнер frontend стартует локально.
    Prompt для Claude Code: Создай Dockerfile для frontend VibeBoard на React + TypeScript. Сделай минимальную рабочую конфигурацию для локального запуска.

95. Название: Добавить базовый docker-compose
    Описание: Подготовить локальную среду разработки.
    Требования: Поднять frontend, backend, postgres.
    Критерии: docker-compose up запускает основные сервисы.
    Prompt для Claude Code: Создай базовый docker-compose.yml для VibeBoard с сервисами frontend, backend и postgres. Сделай конфигурацию пригодной для локальной разработки.

96. Название: Добавить backend тест регистрации
    Описание: Создать тест на успешную регистрацию пользователя.
    Требования: Проверить создание записи и корректный response.
    Критерии: Тест проходит.
    Prompt для Claude Code: Напиши backend тест для endpoint регистрации в VibeBoard. Проверь успешное создание пользователя и корректный response.

97. Название: Добавить backend тест логина
    Описание: Создать тест на успешный вход.
    Требования: Проверить выдачу токена.
    Критерии: Тест проходит.
    Prompt для Claude Code: Напиши backend тест для endpoint логина в VibeBoard. Проверь успешную авторизацию и наличие access token в ответе.

98. Название: Добавить frontend тест login form
    Описание: Создать тест UI-формы входа.
    Требования: Проверить рендер и базовую валидацию.
    Критерии: Тест проходит.
    Prompt для Claude Code: Напиши frontend тест для страницы login в VibeBoard. Проверь рендер формы и базовую валидацию пустых полей.

99. Название: Добавить frontend тест TaskCard
    Описание: Создать тест карточки задачи.
    Требования: Проверить отображение title, priority и due date.
    Критерии: Тест проходит.
    Prompt для Claude Code: Напиши frontend тест для компонента TaskCard в VibeBoard. Проверь, что корректно отображаются title, priority и due date.

100. Название: Добавить README по запуску проекта
     Описание: Подготовить краткую инструкцию по запуску frontend и backend.
     Требования: Описать env, локальный запуск и docker-compose.
     Критерии: Новый разработчик может быстро поднять проект.
     Prompt для Claude Code: Создай README для проекта VibeBoard с инструкцией по локальному запуску frontend и backend, настройке env и запуску через docker-compose.
