# VibeBoard — задачи в структурированном формате

---

## 1. Создать базовую структуру frontend-проекта (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript + Tailwind CSS)

Контекст  
Что пишем? Каркас SPA-приложения VibeBoard с базовой доменной структурой директорий по архитектуре FSD.

Ограничения  
Чего НЕ делать? Не добавлять бизнес-логику, не подключать API, не создавать компоненты страниц — только скелет.

Формат  
Как выдать? Файлы и папки в репозитории: app, pages, widgets, features, entities, shared, App.tsx, main entrypoint, базовый layout.

Критерии  
Когда готово? Проект запускается локально. Пустые директории по архитектуре созданы. Tailwind стили применяются. На экране отображается базовый layout с заголовком VibeBoard.

Задача: Создай базовую структуру frontend-проекта VibeBoard на React + TypeScript + Tailwind CSS. Используй папки app, pages, widgets, features, entities, shared. Подключи Tailwind, создай App.tsx, main entrypoint и простой layout с заголовком VibeBoard. Не добавляй лишнюю бизнес-логику.

---

## 2. Настроить frontend-роутинг (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript)

Контекст  
Что пишем? Маршрутизацию для основных страниц приложения VibeBoard.

Ограничения  
Чего НЕ делать? Не реализовывать содержимое страниц — только route-level компоненты с заголовками-заглушками.

Формат  
Как выдать? Код роутера и отдельные компоненты для каждой страницы: login, register, onboarding, dashboard, calendar, analytics, settings, billing, workspace.

Критерии  
Когда готово? Переход между роутами работает. Каждая страница рендерит временный заголовок.

Задача: Подключи роутинг в frontend VibeBoard. Добавь страницы login, register, onboarding, dashboard, calendar, analytics, settings, billing, workspace. Для каждой страницы создай простой route-level компонент с временным заголовком.

---

## 3. Создать базовую тему light/dark (done)

Роль  
Кто пишет? Senior Frontend Developer (React + Tailwind CSS)

Контекст  
Что пишем? Поддержку светлой и тёмной темы на уровне всего приложения.

Ограничения  
Чего НЕ делать? Не усложнять — никакой системы токенов или CSS-in-JS. Только Tailwind + минимальный ThemeProvider.

Формат  
Как выдать? ThemeProvider компонент, кнопка переключения, сохранение в localStorage.

Критерии  
Когда готово? Кнопка переключения работает. После перезагрузки страницы тема сохраняется.

Задача: Реализуй в VibeBoard базовую поддержку light/dark theme. Сделай ThemeProvider, кнопку переключения и сохранение текущей темы в localStorage. Используй Tailwind и минимальную реализацию.

---

## 4. Создать UI-компонент AppShell (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript + Tailwind CSS)

Контекст  
Что пишем? Общий каркас защищённых страниц с sidebar и header для переиспользования на dashboard и внутренних экранах.

Ограничения  
Чего НЕ делать? Не добавлять бизнес-логику, не подключать данные — только структура и адаптивная вёрстка.

Формат  
Как выдать? Компонент AppShell с header, sidebar и main content area на Tailwind.

Критерии  
Когда готово? Компонент можно использовать на dashboard и других внутренних страницах. Sidebar и header отображаются корректно.

Задача: Создай переиспользуемый компонент AppShell для VibeBoard. Внутри должны быть header, sidebar и main content area. Сделай адаптивную верстку на Tailwind без бизнес-логики.

---

## 5. Описать frontend-типы пользователя и подписки (done)

Роль  
Кто пишет? Senior Frontend Developer (TypeScript)

Контекст  
Что пишем? TypeScript-типы для сущностей User, Subscription, Plan, WorkspaceRole — основа типизации всего приложения.

Ограничения  
Чего НЕ делать? Не использовать any. Не смешивать типы разных доменов в одном файле.

Формат  
Как выдать? Файлы типов в shared/types или entities, экспортируемые для использования в других модулях.

Критерии  
Когда готово? Типы покрывают email, id, settings, current plan, billing status, workspace role. Их можно импортировать без ошибок.

Задача: Создай TypeScript-типы для сущностей User, Subscription, Plan, WorkspaceRole в проекте VibeBoard. Учитывай freemium, pro и team планы. Не используй any.

---

## 6. Описать frontend-типы доски (done)

Роль  
Кто пишет? Senior Frontend Developer (TypeScript)

Контекст  
Что пишем? TypeScript-типы для Board, Column, Task, ChecklistItem, Label, TimeEntry — основа для kanban, модалки задачи и аналитики.

Ограничения  
Чего НЕ делать? Не использовать any. Не упрощать модель задачи до минимума — учитывать все атрибуты.

Формат  
Как выдать? Файлы типов в shared/types или entities.

Критерии  
Когда готово? Все сущности типизированы. Типы пригодны для dashboard, task modal и analytics без ошибок компилятора.

Задача: Создай TypeScript-типы для Board, Column, Task, ChecklistItem, Label, TimeEntry в VibeBoard. Учитывай kanban, дедлайны, приоритеты, чеклисты и time tracking. Не используй any.

---

## 7. Создать страницу login (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript + Tailwind CSS)

Контекст  
Что пишем? UI-страницу входа по email и паролю, готовую к подключению authApi.

Ограничения  
Чего НЕ делать? Не подключать API — только UI и клиентская валидация. Не добавлять OAuth-кнопки на этом этапе.

Формат  
Как выдать? Компонент страницы login с формой, валидацией и ссылкой на регистрацию.

Критерии  
Когда готово? Форма рендерится. Валидация пустых полей работает. Страница готова к подключению API.

Задача: Создай страницу login для VibeBoard. Добавь поля email и password, кнопку входа, ссылку на регистрацию и простую клиентскую валидацию. Используй React + TypeScript + Tailwind.

---

## 8. Создать страницу register

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript + Tailwind CSS)

Контекст  
Что пишем? UI-страницу регистрации с валидацией совпадения паролей.

Ограничения  
Чего НЕ делать? Не подключать API. Не добавлять лишние поля (имя, телефон и т.д.) без запроса.

Формат  
Как выдать? Компонент страницы register с полями и валидацией.

Критерии  
Когда готово? Форма рендерится и показывает ошибки для пустых полей и несовпадающих паролей.

Задача: Создай страницу register для VibeBoard. Добавь поля email, password, confirmPassword, кнопку регистрации и простую клиентскую валидацию, включая проверку совпадения паролей.

---

## 9. Создать frontend auth store (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript)

Контекст  
Что пишем? Клиентское состояние авторизации — единый источник истины для user, token и auth status.

Ограничения  
Чего НЕ делать? Не хранить sensitive данные там, где это небезопасно. Не усложнять реализацию — только необходимый минимум.

Формат  
Как выдать? Store-модуль с типизированным состоянием и методами setAuth и logout.

Критерии  
Когда готово? Store создаётся и используется из компонентов. После logout состояние полностью очищается.

Задача: Создай auth store для frontend VibeBoard. Храни user, accessToken и authStatus. Добавь методы setAuth и logout. Реализация должна быть простой и типизированной.

---

## 10. Реализовать frontend route guard (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript)

Контекст  
Что пишем? Защиту приватных маршрутов — редирект неавторизованных пользователей на login.

Ограничения  
Чего НЕ делать? Не дублировать логику auth store — использовать существующий store.

Формат  
Как выдать? Компонент ProtectedRoute, обёртывающий приватные роуты.

Критерии  
Когда готово? При отключённой авторизации приватные страницы недоступны — редирект на /login.

Задача: Реализуй ProtectedRoute для VibeBoard. Если пользователь не авторизован, перенаправляй его на /login. Используй существующий auth store.

---

## 11. Создать onboarding-страницу  (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript + Tailwind CSS)

Контекст  
Что пишем? Экран первого входа нового пользователя с созданием personal workspace.

Ограничения  
Чего НЕ делать? Не подключать API. Не делать многошаговый wizard — достаточно одного экрана.

Формат  
Как выдать? Компонент страницы onboarding с полем для названия workspace и кнопкой Continue.

Критерии  
Когда готово? Страница готова к интеграции с backend. UI соответствует остальным экранам.

Задача: Создай onboarding страницу VibeBoard с полем для названия первого workspace и кнопкой Continue. Добавь простую валидацию и аккуратный UI.

---

## 12. Создать layout страницы dashboard (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript + Tailwind CSS)

Контекст  
Что пишем? Статический каркас основного kanban-dashboard без логики — подготовка к подключению досок и колонок.

Ограничения  
Чего НЕ делать? Не добавлять данные и бизнес-логику. Только структура секций.

Формат  
Как выдать? Компонент страницы dashboard с секциями board header, columns area, sidebar tools внутри AppShell.

Критерии  
Когда готово? Структура готова для последующего подключения досок и колонок.

Задача: Создай layout страницы dashboard для VibeBoard. Используй AppShell. Покажи board header, область колонок и боковую панель инструментов как статические блоки.

---

## 13. Создать компонент BoardHeader (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript + Tailwind CSS)

Контекст  
Что пишем? Заголовок доски с названием и кнопками действий — создание колонки и задачи.

Ограничения  
Чего НЕ делать? Не добавлять логику открытия модалок — только props и рендер.

Формат  
Как выдать? Компонент BoardHeader с типизированными props.

Критерии  
Когда готово? Компонент принимает название доски и корректно рендерит кнопки Add column и Add task.

Задача: Создай компонент BoardHeader для VibeBoard. Он должен принимать название доски и отображать кнопки Add column и Add task. Используй TypeScript props.

---

## 14. Создать компонент KanbanColumn (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript + Tailwind CSS)

Контекст  
Что пишем? UI одной колонки kanban-доски с заголовком, счётчиком и списком карточек.

Ограничения  
Чего НЕ делать? Не реализовывать drag and drop на этом этапе. Только отображение данных.

Формат  
Как выдать? Компонент KanbanColumn, принимающий column и список tasks через props.

Критерии  
Когда готово? Компонент принимает Column и Task[] и корректно отображает данные.

Задача: Создай компонент KanbanColumn для VibeBoard. Покажи title колонки, количество задач и список карточек. Используй типы Column и Task.

---

## 15. Создать компонент TaskCard (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript + Tailwind CSS)

Контекст  
Что пишем? Карточку задачи для kanban-доски с отображением ключевых атрибутов.

Ограничения  
Чего НЕ делать? Не добавлять интерактивность или модалки — только визуальный рендер данных.

Формат  
Как выдать? Компонент TaskCard, принимающий task через props.

Критерии  
Когда готово? Компонент отображает title, due date, priority, прогресс чеклиста и tracked time без ошибок.

Задача: Создай компонент TaskCard для VibeBoard. Отображай title, due date, priority, прогресс чеклиста и tracked time. Используй Tailwind и TypeScript.

---

## 16. Создать моковые данные доски (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript)

Контекст  
Что пишем? Временные локальные данные для разработки kanban-экрана без backend.

Ограничения  
Чего НЕ делать? Не использовать эти данные как постоянное решение — только для UI разработки.

Формат  
Как выдать? Mock-файл с типизированными данными, подключённый к dashboard.

Критерии  
Когда готово? Dashboard рендерится на моковых данных без backend — одна доска, три колонки, минимум шесть задач.

Задача: Создай mock data для VibeBoard dashboard: одну доску, три колонки и минимум шесть задач с разными приоритетами, дедлайнами и чеклистами. Подключи эти данные к dashboard.

---

## 17. Подключить drag and drop для карточек (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript)

Контекст  
Что пишем? Базовое перемещение задач между колонками на frontend с обновлением локального состояния.

Ограничения  
Чего НЕ делать? Не синхронизировать с сервером на этом этапе — только локальное состояние.

Формат  
Как выдать? Drag and drop логика в компонентах KanbanColumn и TaskCard.

Критерии  
Когда готово? Карточку можно перетащить в другую колонку. UI обновляется без перезагрузки.

Задача: Добавь drag and drop для TaskCard между KanbanColumn в VibeBoard. Пока реализуй только локальное состояние без серверной синхронизации.

---

## 18. Создать модальное окно задачи (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript + Tailwind CSS)

Контекст  
Что пишем? Modal для просмотра и редактирования карточки задачи с базовыми полями.

Ограничения  
Чего НЕ делать? Не подключать API. Не добавлять все поля сразу — только title, description, due date, priority.

Формат  
Как выдать? Компонент TaskModal с props task и onClose.

Критерии  
Когда готово? При открытии показываются данные задачи. Модалка закрывается корректно.

Задача: Создай TaskModal для VibeBoard. Покажи поля title, description, due date и priority. Добавь кнопку закрытия и поддержку передачи task через props.

---

## 19. Добавить чеклист в модалку задачи (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript + Tailwind CSS)

Контекст  
Что пишем? Расширение TaskModal поддержкой checklist с подсчётом выполненных пунктов.

Ограничения  
Чего НЕ делать? Не подключать API — хранить изменения локально в состоянии модалки.

Формат  
Как выдать? Секция чеклиста внутри TaskModal с чекбоксами и счётчиком.

Критерии  
Когда готово? В модалке чеклист отображается и локально переключается.

Задача: Расширь TaskModal в VibeBoard: добавь отображение checklist с чекбоксами и подсчётом выполненных пунктов. Пока храни изменения локально.

---

## 20. Добавить UI Pomodoro-таймера в задачу (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript + Tailwind CSS)

Контекст  
Что пишем? Визуальный блок Pomodoro-таймера внутри TaskModal с локальной работой.

Ограничения  
Чего НЕ делать? Не подключать к backend на этом этапе. Только локальная работа таймера.

Формат  
Как выдать? Блок таймера в TaskModal с кнопками Start, Pause, Stop и отображением времени.

Критерии  
Когда готово? Таймер запускается, ставится на паузу и останавливается локально.

Задача: Добавь в TaskModal VibeBoard UI-блок Pomodoro timer с кнопками Start, Pause, Stop и отображением текущего времени. Реализуй локальную работу таймера.

---

## 21. Создать страницу Calendar (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript + Tailwind CSS)

Контекст  
Что пишем? Базовый экран календарного представления задач, сгруппированных по дедлайнам.

Ограничения  
Чего НЕ делать? Не реализовывать полноценную сетку календаря — достаточно grouped list по датам.

Формат  
Как выдать? Компонент страницы Calendar с группировкой задач по due date.

Критерии  
Когда готово? Страница отображает задачи, сгруппированные по due date.

Задача: Создай базовую страницу Calendar для VibeBoard. Пока без полноценной сетки календаря — достаточно сгруппировать задачи по due date и отобразить список по датам.

---

## 22. Создать страницу Analytics (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript + Tailwind CSS)

Контекст  
Что пишем? Экран аналитики продуктивности с четырьмя статистическими карточками.

Ограничения  
Чего НЕ делать? Не подключать к API — использовать mock values. Не строить сложные графики на этом этапе.

Формат  
Как выдать? Страница Analytics с карточками completed tasks, tracked time, streak, pomodoro sessions.

Критерии  
Когда готово? Страница готова к подключению реальных метрик. Четыре карточки отображаются корректно.

Задача: Создай страницу Analytics для VibeBoard. Добавь четыре статистические карточки: completed tasks, tracked time, streak, pomodoro sessions. Пока используй mock values.

---

## 23. Создать страницу Settings (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript + Tailwind CSS)

Контекст  
Что пишем? UI пользовательских настроек с базовыми секциями.

Ограничения  
Чего НЕ делать? Не подключать API. Секцию Notifications делать как заглушку.

Формат  
Как выдать? Страница Settings с секциями Profile, Theme и Notifications. Theme подключён к переключателю темы.

Критерии  
Когда готово? Страница отображается. Переключение темы в секции Theme работает.

Задача: Создай страницу Settings для VibeBoard. Добавь секции Profile, Theme и Notifications. В Theme подключи переключение light/dark.

---

## 24. Создать страницу Billing (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript + Tailwind CSS)

Контекст  
Что пишем? UI управления подпиской — отображение тарифов и кнопки для действий со Stripe.

Ограничения  
Чего НЕ делать? Не делать реальных запросов на этом этапе. Только визуальный UI.

Формат  
Как выдать? Страница Billing с текущим тарифом, карточками планов Free/Pro/Team и кнопками Upgrade и Manage billing.

Критерии  
Когда готово? Страница визуально готова к интеграции со Stripe.

Задача: Создай страницу Billing для VibeBoard. Покажи текущий тариф, карточки Free, Pro и Team, а также кнопки Upgrade и Manage billing. Пока без реальных запросов.

---

## 25. Создать страницу Workspace (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript + Tailwind CSS)

Контекст  
Что пишем? Экран управления участниками workspace с таблицей и приглашением.

Ограничения  
Чего НЕ делать? Не подключать API — использовать mock data для списка участников.

Формат  
Как выдать? Страница Workspace со списком участников (имя, email, роль) и кнопкой Invite member.

Критерии  
Когда готово? Страница отображает моковый список участников.

Задача: Создай страницу Workspace для VibeBoard. Добавь список участников с именем, email и ролью, а также кнопку Invite member. Используй mock data.

---

## 26. Создать API-клиент frontend (done)

Роль  
Кто пишет? Senior Frontend Developer (TypeScript)

Контекст  
Что пишем? Общий слой HTTP-запросов для всего frontend — основа для всех API-модулей.

Ограничения  
Чего НЕ делать? Не добавлять domain-specific логику в общий клиент. Только base URL, headers и обработка ошибок.

Формат  
Как выдать? Модуль api client, готовый для импорта в authApi и другие сервисы.

Критерии  
Когда готово? Модуль компилируется. Его можно импортировать в authApi без ошибок.

Задача: Создай общий api client для frontend VibeBoard. Добавь base URL, стандартные JSON headers и простую обработку ошибок. Сделай модуль пригодным для повторного использования.

---

## 27. Создать authApi на frontend (done)

Роль  
Кто пишет? Senior Frontend Developer (TypeScript)

Контекст  
Что пишем? Методы авторизации на базе общего api client — login, register, me, refresh.

Ограничения  
Чего НЕ делать? Не вызывать fetch напрямую — использовать только общий api client.

Формат  
Как выдать? Модуль authApi с типизированными методами и DTO.

Критерии  
Когда готово? Модуль компилируется и готов к интеграции с login и register страницами.

Задача: Создай модуль authApi для VibeBoard frontend. Добавь методы login, register, getMe и refreshToken. Используй типизированные DTO и общий api client.

---

## 28. Создать boardsApi на frontend (done)

Роль  
Кто пишет? Senior Frontend Developer (TypeScript)

Контекст  
Что пишем? Методы работы с досками для dashboard — list, get, create.

Ограничения  
Чего НЕ делать? Не вызывать fetch напрямую. Не добавлять методы, которых ещё нет в backend.

Формат  
Как выдать? Модуль boardsApi с методами listBoards, getBoard, createBoard.

Критерии  
Когда готово? Модуль готов к использованию в dashboard.

Задача: Создай boardsApi для frontend VibeBoard. Добавь методы listBoards, getBoard и createBoard. Используй общий api client и TypeScript-типы.

---

## 29. Создать tasksApi на frontend (done)

Роль  
Кто пишет? Senior Frontend Developer (TypeScript)

Контекст  
Что пишем? Методы CRUD для задач — create, update, delete, move.

Ограничения  
Чего НЕ делать? Не смешивать API-логику с UI-компонентами. Только чистый модуль с типизированными методами.

Формат  
Как выдать? Модуль tasksApi с методами createTask, updateTask, deleteTask, moveTask.

Критерии  
Когда готово? Модуль готов к интеграции с kanban и task modal.

Задача: Создай tasksApi для frontend VibeBoard. Добавь методы createTask, updateTask, deleteTask и moveTask. Используй типизированные payloads.

---

## 30. Создать analyticsApi на frontend (done)

Роль  
Кто пишет? Senior Frontend Developer (TypeScript)

Контекст  
Что пишем? Методы получения аналитических данных для страницы Analytics.

Ограничения  
Чего НЕ делать? Не добавлять вычислений на стороне клиента — только получение данных с сервера.

Формат  
Как выдать? Модуль analyticsApi с методами getOverview и getProductivityStats.

Критерии  
Когда готово? Модуль компилируется и пригоден для Analytics page.

Задача: Создай analyticsApi для frontend VibeBoard. Добавь методы getOverview и getProductivityStats. Используй общий api client и типизированные ответы.

---

## 31. Создать billingApi на frontend (done)

Роль  
Кто пишет? Senior Frontend Developer (TypeScript)

Контекст  
Что пишем? Методы для работы с подпиской и Stripe-интеграцией со стороны клиента.

Ограничения  
Чего НЕ делать? Не вызывать Stripe напрямую — только backend endpoints. Не хранить payment data на клиенте.

Формат  
Как выдать? Модуль billingApi с методами getSubscription, createCheckoutSession, getBillingPortalUrl.

Критерии  
Когда готово? Модуль готов к подключению Billing page.

Задача: Создай billingApi для frontend VibeBoard. Добавь методы getSubscription, createCheckoutSession и getBillingPortalUrl. Используй общий api client.

---

## 32. Создать backend-структуру проекта (done)

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? Каркас FastAPI-проекта по слоям — основу для всей backend-разработки VibeBoard.

Ограничения  
Чего НЕ делать? Не писать бизнес-логику. Только структура директорий и health endpoint.

Формат  
Как выдать? Папки routers, schemas, services, repositories, models, core, integrations. Файл main.py и health endpoint.

Критерии  
Когда готово? Приложение стартует. Health endpoint отвечает.

Задача: Создай базовую структуру backend-проекта VibeBoard на FastAPI. Добавь папки routers, schemas, services, repositories, models, core, integrations. Создай main.py и health endpoint.

---

## 33. Настроить backend-конфигурацию через env (done)

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? Settings-модуль для загрузки конфигурации из переменных окружения.

Ограничения  
Чего НЕ делать? Не хардкодить значения конфигурации в коде. Не класть секреты в репозиторий.

Формат  
Как выдать? Pydantic Settings или аналог с полями DATABASE_URL, JWT_SECRET, STRIPE_SECRET_KEY, REDIS_URL.

Критерии  
Когда готово? Конфиг загружается из env и используется приложением без ошибок.

Задача: Добавь в backend VibeBoard конфигурацию через env variables. Поддержи DATABASE_URL, JWT_SECRET, STRIPE_SECRET_KEY и REDIS_URL через Pydantic settings или аналогичный подход.

---

## 34. Подключить SQLAlchemy и session factory (done)

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python + PostgreSQL)

Контекст  
Что пишем? Подключение к PostgreSQL через SQLAlchemy — основа для всех репозиториев.

Ограничения  
Чего НЕ делать? Не смешивать engine и session в одном файле с бизнес-логикой.

Формат  
Как выдать? Engine, SessionLocal, Base и FastAPI dependency для получения DB session.

Критерии  
Когда готово? Приложение может получить DB session через dependency injection.

Задача: Настрой в backend VibeBoard SQLAlchemy для PostgreSQL. Создай engine, SessionLocal, Base и dependency для получения DB session в FastAPI.

---

## 35. Создать модель User (done)

Роль  
Кто пишет? Senior Backend Developer (SQLAlchemy + PostgreSQL)

Контекст  
Что пишем? ORM-модель пользователя — основу для регистрации, авторизации и связанных сущностей.

Ограничения  
Чего НЕ делать? Не хранить пароль в открытом виде. Только password_hash.

Формат  
Как выдать? SQLAlchemy-модель User с полями id, email, password_hash, created_at, updated_at.

Критерии  
Когда готово? Модель импортируется без ошибок и готова к миграциям.

Задача: Создай SQLAlchemy-модель User для VibeBoard backend. Добавь id, email, password_hash, created_at и updated_at. Используй PostgreSQL-friendly типы.

---

## 36. Создать модель Workspace (done)

Роль  
Кто пишет? Senior Backend Developer (SQLAlchemy + PostgreSQL)

Контекст  
Что пишем? ORM-модель рабочего пространства со связью с пользователем-владельцем.

Ограничения  
Чего НЕ делать? Не объединять workspace и membership в одной модели.

Формат  
Как выдать? SQLAlchemy-модель Workspace с полями и relationship на User.

Критерии  
Когда готово? Модель создана. Связь с User настроена.

Задача: Создай SQLAlchemy-модель Workspace для VibeBoard. Добавь id, name, owner_id, created_at, updated_at и связь с User.

---

## 37. Создать модель WorkspaceMember

Роль  
Кто пишет? Senior Backend Developer (SQLAlchemy + PostgreSQL)

Контекст  
Что пишем? ORM-модель связи пользователя и workspace с ролью — основа системы прав.

Ограничения  
Чего НЕ делать? Не допускать дублирования записей — необходим unique constraint на пару workspace_id + user_id.

Формат  
Как выдать? SQLAlchemy-модель WorkspaceMember с внешними ключами, ролью и unique constraint.

Критерии  
Когда готово? Заданы внешние ключи и уникальность пары workspace_id + user_id.

Задача: Создай SQLAlchemy-модель WorkspaceMember для VibeBoard. Добавь workspace_id, user_id и role. Настрой foreign keys и unique constraint на пару workspace_id и user_id.

---

## 38. Создать модель Board

Роль  
Кто пишет? Senior Backend Developer (SQLAlchemy + PostgreSQL)

Контекст  
Что пишем? ORM-модель доски со связью с workspace.

Ограничения  
Чего НЕ делать? Не допускать доску без workspace_id.

Формат  
Как выдать? SQLAlchemy-модель Board с полями и связями.

Критерии  
Когда готово? Связь с Workspace настроена. Модель готова к миграциям.

Задача: Создай SQLAlchemy-модель Board для VibeBoard. Добавь id, name, workspace_id, created_by, created_at и updated_at. Настрой связи.

---

## 39. Создать модель Column (done)

Роль  
Кто пишет? Senior Backend Developer (SQLAlchemy + PostgreSQL)

Контекст  
Что пишем? ORM-модель колонки kanban-доски с явным полем порядка.

Ограничения  
Чего НЕ делать? Не использовать timestamp или id как суррогат для порядка — только явный position field.

Формат  
Как выдать? SQLAlchemy-модель Column с полями id, title, board_id, position и связью с Board.

Критерии  
Когда готово? Связь с Board настроена. Поле position присутствует.

Задача: Создай SQLAlchemy-модель Column для VibeBoard. Добавь id, title, board_id и position. Настрой связь с Board.

---

## 40. Создать модель Task (done)

Роль  
Кто пишет? Senior Backend Developer (SQLAlchemy + PostgreSQL)

Контекст  
Что пишем? ORM-модель задачи — центральная сущность всего приложения.

Ограничения  
Чего НЕ делать? Не упрощать модель. Все поля должны присутствовать согласно ТЗ.

Формат  
Как выдать? SQLAlchemy-модель Task с полным набором полей и связями с Board и Column.

Критерии  
Когда готово? Модель покрывает id, title, description, due_date, priority, status, board_id, column_id, position, tracked_time_total.

Задача: Создай SQLAlchemy-модель Task для VibeBoard. Добавь id, title, description, due_date, priority, status, board_id, column_id, position и tracked_time_total. Настрой связи с Board и Column.

---

## 41. Создать модель ChecklistItem (done)

Роль  
Кто пишет? Senior Backend Developer (SQLAlchemy + PostgreSQL)

Контекст  
Что пишем? ORM-модель элемента чеклиста задачи с явным порядком.

Ограничения  
Чего НЕ делать? Не объединять в одну строку несколько пунктов.

Формат  
Как выдать? SQLAlchemy-модель ChecklistItem с полями id, task_id, text, is_completed, position.

Критерии  
Когда готово? Связь с Task настроена. Модель готова к миграциям.

Задача: Создай SQLAlchemy-модель ChecklistItem для VibeBoard. Добавь id, task_id, text, is_completed и position. Настрой foreign key и relationship.

---

## 42. Создать модель TimeEntry (done)

Роль  
Кто пишет? Senior Backend Developer (SQLAlchemy + PostgreSQL)

Контекст  
Что пишем? ORM-модель записи времени — основа Pomodoro и time tracking.

Ограничения  
Чего НЕ делать? Не полагаться на вычисления duration на стороне клиента — хранить duration_seconds на сервере.

Формат  
Как выдать? SQLAlchemy-модель TimeEntry с полями id, task_id, user_id, started_at, ended_at, duration_seconds, status.

Критерии  
Когда готово? Связи с Task и User настроены. Поля для жизненного цикла сессии присутствуют.

Задача: Создай SQLAlchemy-модель TimeEntry для VibeBoard. Добавь id, task_id, user_id, started_at, ended_at, duration_seconds и status. Настрой связи.

---

## 43. Создать модель Subscription (done)

Роль  
Кто пишет? Senior Backend Developer (SQLAlchemy + PostgreSQL)

Контекст  
Что пишем? ORM-модель подписки пользователя или workspace — хранение billing состояния и Stripe-данных.

Ограничения  
Чего НЕ делать? Не хранить платёжные данные (номера карт и т.д.) — только Stripe идентификаторы.

Формат  
Как выдать? SQLAlchemy-модель Subscription с полями плана, статуса, Stripe IDs и периода.

Критерии  
Когда готово? Модель покрывает billing и freemium сценарии. Привязка к user или workspace есть.

Задача: Создай SQLAlchemy-модель Subscription для VibeBoard. Добавь поля для плана, статуса, stripe_customer_id, stripe_subscription_id и current_period_end. Учти привязку к user или workspace.

---

## 44. Создать Pydantic-схемы auth (done)

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Pydantic)

Контекст  
Что пишем? Схемы запросов и ответов для endpoint-ов авторизации.

Ограничения  
Чего НЕ делать? Не возвращать ORM-модели напрямую. Не включать password_hash в response схему.

Формат  
Как выдать? Pydantic-схемы RegisterRequest, LoginRequest, TokenResponse, UserResponse с базовой валидацией.

Критерии  
Когда готово? Схемы валидны и импортируются без ошибок.

Задача: Создай Pydantic-схемы для auth в backend VibeBoard: RegisterRequest, LoginRequest, TokenResponse и UserResponse. Добавь базовую валидацию email и обязательных полей.

---

## 45. Создать Pydantic-схемы доски (done)

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Pydantic)

Контекст  
Что пишем? Схемы для API-слоя Board, Column и Task.

Ограничения  
Чего НЕ делать? Не возвращать ORM-объекты напрямую. Использовать отдельные схемы для create и response.

Формат  
Как выдать? Pydantic-схемы BoardCreate, BoardResponse, ColumnResponse, TaskResponse.

Критерии  
Когда готово? Схемы готовы для API-слоя и соответствуют ORM-моделям.

Задача: Создай Pydantic-схемы для Board, Column и Task в backend VibeBoard. Нужны минимум BoardCreate, BoardResponse, ColumnResponse и TaskResponse.

---

## 46. Реализовать password hashing utility (done)

Роль  
Кто пишет? Senior Backend Developer (Python)

Контекст  
Что пишем? Утилиту хеширования и верификации паролей — основу для AuthService.

Ограничения  
Чего НЕ делать? Не использовать небезопасные алгоритмы (md5, sha1). Только bcrypt или аналог.

Формат  
Как выдать? Функции hash_password и verify_password в core или utils модуле.

Критерии  
Когда готово? Утилита готова к использованию в AuthService.

Задача: Добавь в backend VibeBoard utility для password hashing. Нужны функции hash_password и verify_password с безопасной реализацией.

---

## 47. Реализовать JWT utility (done)

Роль  
Кто пишет? Senior Backend Developer (Python)

Контекст  
Что пишем? Генерацию и проверку JWT access token с user id и сроком действия.

Ограничения  
Чего НЕ делать? Не хранить чувствительные данные в payload токена. Только user id и expiration.

Формат  
Как выдать? Функции create_access_token и decode_access_token в core/security модуле.

Критерии  
Когда готово? Токен содержит user id и срок действия. Декодирование проверяет подпись.

Задача: Добавь JWT utility в backend VibeBoard. Реализуй create_access_token и decode_access_token. Токен должен содержать user id и expiration.

---

## 48. Создать UserRepository (done)

Роль  
Кто пишет? Senior Backend Developer (SQLAlchemy + Python)

Контекст  
Что пишем? Репозиторий для работы с пользователями — базовые методы чтения и создания.

Ограничения  
Чего НЕ делать? Не добавлять бизнес-логику в репозиторий. Только работа с базой данных.

Формат  
Как выдать? Класс UserRepository с методами get_by_email, get_by_id, create.

Критерии  
Когда готово? Репозиторий использует SQLAlchemy session и компилируется без ошибок.

Задача: Создай UserRepository для backend VibeBoard. Добавь методы get_by_email, get_by_id и create. Используй SQLAlchemy session.

---

## 49. Реализовать AuthService.register (done)

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? Сервис регистрации пользователя с проверкой уникальности email и хешированием пароля.

Ограничения  
Чего НЕ делать? Не хранить пароль в открытом виде. Не делать SQL-запросы напрямую в сервисе.

Формат  
Как выдать? Метод AuthService.register, использующий UserRepository и password hashing utility.

Критерии  
Когда готово? Сервис возвращает созданного пользователя. При дублировании email — корректная ошибка.

Задача: Реализуй AuthService.register в backend VibeBoard. Проверяй уникальность email, хешируй пароль и сохраняй пользователя через UserRepository.

---

## 50. Реализовать AuthService.login (done)

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? Сервис входа с проверкой пароля и генерацией JWT access token.

Ограничения  
Чего НЕ делать? Не возвращать подробности о причине неудачи (email не найден vs неверный пароль) — единое сообщение об ошибке.

Формат  
Как выдать? Метод AuthService.login, возвращающий токен и данные пользователя.

Критерии  
Когда готово? При корректных данных возвращается JWT token и пользователь.

Задача: Реализуй AuthService.login для backend VibeBoard. Проверь email и пароль, сгенерируй JWT access token и верни пользователя с токеном.

---

## 51. Создать auth router register (done)

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? HTTP endpoint регистрации пользователя.

Ограничения  
Чего НЕ делать? Не писать бизнес-логику в router — только делегировать в AuthService.

Формат  
Как выдать? Endpoint POST /api/v1/auth/register с Pydantic-схемами.

Критерии  
Когда готово? Endpoint возвращает корректный response schema.

Задача: Создай endpoint POST /api/v1/auth/register в backend VibeBoard. Используй AuthService.register и соответствующие Pydantic-схемы.

---

## 52. Создать auth router login (done)

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? HTTP endpoint входа пользователя с выдачей токена.

Ограничения  
Чего НЕ делать? Не писать логику верификации в router. Только делегировать в AuthService.

Формат  
Как выдать? Endpoint POST /api/v1/auth/login, возвращающий TokenResponse.

Критерии  
Когда готово? Endpoint отдаёт токен и пользователя при корректных данных.

Задача: Создай endpoint POST /api/v1/auth/login в backend VibeBoard. Используй AuthService.login и верни TokenResponse.

---

## 53. Реализовать dependency current user (done)

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? FastAPI dependency для получения текущего пользователя из JWT — используется во всех защищённых endpoints.

Ограничения  
Чего НЕ делать? Не доверять данным из тела запроса для авторизации — только JWT из Authorization header.

Формат  
Как выдать? Функция get_current_user для использования как Depends в роутерах.

Критерии  
Когда готово? Dependency готова для защищённых endpoints. Загружает пользователя из базы по токену.

Задача: Добавь dependency get_current_user для backend VibeBoard. Извлекай JWT из Authorization header, декодируй его и загружай пользователя из базы.

---

## 54. Создать WorkspaceRepository.create (done)

Роль  
Кто пишет? Senior Backend Developer (SQLAlchemy + Python)

Контекст  
Что пишем? Логику создания workspace с автоматическим добавлением owner membership.

Ограничения  
Чего НЕ делать? Не создавать workspace без membership — операция должна быть атомарной.

Формат  
Как выдать? Метод в репозитории или сервисе, создающий Workspace и WorkspaceMember(role=owner).

Критерии  
Когда готово? После вызова создаются две связанные записи: Workspace и WorkspaceMember.

Задача: Добавь в backend VibeBoard логику создания workspace с owner membership. Реализуй репозиторий или сервис, который создаёт Workspace и WorkspaceMember с ролью owner.

---

## 55. Создать endpoint создания workspace (done)

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? API endpoint для создания первого workspace — вызывается на onboarding.

Ограничения  
Чего НЕ делать? Не допускать создание workspace без авторизованного пользователя.

Формат  
Как выдать? Endpoint POST /api/v1/workspaces с защитой через get_current_user.

Критерии  
Когда готово? Авторизованный пользователь может создать workspace. Возвращается созданный workspace.

Задача: Создай endpoint POST /api/v1/workspaces в backend VibeBoard. Только для авторизованного пользователя. При создании автоматически добавляй owner membership.

---

## 56. Создать BoardRepository.create (done)

Роль  
Кто пишет? Senior Backend Developer (SQLAlchemy + Python)

Контекст  
Что пишем? Репозиторный метод создания доски в указанном workspace.

Ограничения  
Чего НЕ делать? Не проверять права доступа в репозитории — это задача сервиса.

Формат  
Как выдать? Класс BoardRepository с методом create(name, workspace_id, created_by).

Критерии  
Когда готово? Метод возвращает созданную доску.

Задача: Создай BoardRepository с методом create для backend VibeBoard. Метод должен создавать доску в указанном workspace.

---

## 57. Создать endpoint создания доски (done)

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? API endpoint создания board с проверкой membership пользователя.

Ограничения  
Чего НЕ делать? Не пропускать проверку доступа к workspace. Feature gate для free плана — отдельная задача.

Формат  
Как выдать? Endpoint POST /api/v1/boards с проверкой workspace membership.

Критерии  
Когда готово? Авторизованный пользователь с доступом к workspace может создать board.

Задача: Создай endpoint POST /api/v1/boards для backend VibeBoard. Проверь, что текущий пользователь состоит в workspace, и создай board.

---

## 58. Создать endpoint списка досок (done)

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? API endpoint получения досок с фильтром по workspace.

Ограничения  
Чего НЕ делать? Не возвращать доски workspace, к которому у пользователя нет доступа.

Формат  
Как выдать? Endpoint GET /api/v1/boards?workspace_id= с проверкой membership.

Критерии  
Когда готово? Возвращается список досок только доступного workspace.

Задача: Создай endpoint GET /api/v1/boards с фильтром workspace_id для backend VibeBoard. Возвращай только доски workspace, к которому у текущего пользователя есть доступ.

---

## 59. Создать ColumnRepository.create (done)

Роль  
Кто пишет? Senior Backend Developer (SQLAlchemy + Python)

Контекст  
Что пишем? Репозиторный метод создания колонки с автоматическим расчётом position.

Ограничения  
Чего НЕ делать? Не допускать коллизий position — новая колонка всегда в конце.

Формат  
Как выдать? Метод ColumnRepository.create с автоматическим position в конце списка.

Критерии  
Когда готово? Новая колонка создаётся с корректным position.

Задача: Создай ColumnRepository.create для backend VibeBoard. При создании новой колонки автоматически ставь её в конец по position внутри board.

---

## 60. Создать endpoint создания колонки (done)

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? API endpoint создания колонки с проверкой доступа к board.

Ограничения  
Чего НЕ делать? Не пропускать проверку доступа к board.

Формат  
Как выдать? Endpoint POST /api/v1/columns с авторизацией и возвратом созданной колонки.

Критерии  
Когда готово? Колонка создаётся с position в конце и возвращается клиенту.

Задача: Создай endpoint POST /api/v1/columns для backend VibeBoard. Проверь доступ к board и создай новую колонку с position в конце.

---

## 61. Создать TaskRepository.create (done)

Роль  
Кто пишет? Senior Backend Developer (SQLAlchemy + Python)

Контекст  
Что пишем? Репозиторный метод создания задачи с автоматическим расчётом position внутри колонки.

Ограничения  
Чего НЕ делать? Не устанавливать position вручную снаружи — логика в репозитории.

Формат  
Как выдать? Метод TaskRepository.create с автоматическим position в конце колонки.

Критерии  
Когда готово? Новая задача создаётся с корректным position.

Задача: Создай TaskRepository.create для backend VibeBoard. При создании задачи автоматически рассчитывай position в конце указанной колонки.

---

## 62. Создать endpoint создания задачи (done)

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? API endpoint создания task с проверкой доступа к board и column.

Ограничения  
Чего НЕ делать? Не допускать создание задачи в колонке чужой доски.

Формат  
Как выдать? Endpoint POST /api/v1/tasks с проверкой доступа и возвратом по response schema.

Критерии  
Когда готово? Задача создаётся и возвращается по response schema.

Задача: Создай endpoint POST /api/v1/tasks для backend VibeBoard. Проверь доступ к board и column, затем создай задачу.

---

## 63. Создать endpoint обновления задачи (done)

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? API endpoint частичного обновления задачи — title, description, due_date, priority, status.

Ограничения  
Чего НЕ делать? Не требовать все поля — только частичное обновление (PATCH).

Формат  
Как выдать? Endpoint PATCH /api/v1/tasks/{task_id} с поддержкой partial update.

Критерии  
Когда готово? Частичное обновление работает корректно. Не переданные поля не сбрасываются.

Задача: Создай endpoint PATCH /api/v1/tasks/{task_id} для backend VibeBoard. Поддержи частичное обновление title, description, due_date, priority и status.

---

## 64. Создать endpoint удаления задачи (done)

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? API endpoint удаления task с проверкой доступа.

Ограничения  
Чего НЕ делать? Не допускать удаление задач чужих workspace.

Формат  
Как выдать? Endpoint DELETE /api/v1/tasks/{task_id} с авторизацией.

Критерии  
Когда готово? Задача удаляется. Клиент получает успешный ответ.

Задача: Создай endpoint DELETE /api/v1/tasks/{task_id} для backend VibeBoard. Проверь доступ текущего пользователя и удали задачу.

---

## 65. Создать endpoint перемещения задачи (done)

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? API endpoint moveTask — перемещение карточки между колонками с обновлением position.

Ограничения  
Чего НЕ делать? Не пересчитывать position всей доски — только необходимый диапазон.

Формат  
Как выдать? Endpoint PATCH /api/v1/tasks/{task_id}/move, принимающий target_column_id и target_position.

Критерии  
Когда готово? column_id и position задачи обновляются корректно.

Задача: Создай endpoint PATCH /api/v1/tasks/{task_id}/move для backend VibeBoard. Принимай target_column_id и target_position, обновляй column_id и position задачи.

---

## 66. Создать endpoint checklist items (done)

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? API endpoint добавления пункта чеклиста к задаче.

Ограничения  
Чего НЕ делать? Не допускать добавление пунктов к чужим задачам.

Формат  
Как выдать? Endpoint POST /api/v1/tasks/{task_id}/checklist-items.

Критерии  
Когда готово? Новый checklist item сохраняется и возвращается.

Задача: Создай endpoint POST /api/v1/tasks/{task_id}/checklist-items в backend VibeBoard. Добавляй пункт чеклиста к задаче и возвращай его.

---

## 67. Создать endpoint toggle checklist item (done)

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? API endpoint переключения статуса выполнения пункта чеклиста.

Ограничения  
Чего НЕ делать? Не допускать изменение пунктов чужих задач.

Формат  
Как выдать? Endpoint PATCH /api/v1/checklist-items/{item_id} для обновления is_completed.

Критерии  
Когда готово? Поле is_completed обновляется корректно.

Задача: Создай endpoint PATCH /api/v1/checklist-items/{item_id} в backend VibeBoard для обновления поля is_completed у checklist item.

---

## 68. Создать endpoint запуска time entry (done)

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? API endpoint начала Pomodoro-сессии с привязкой к задаче.

Ограничения  
Чего НЕ делать? Не допускать несколько активных сессий одновременно у одного пользователя.

Формат  
Как выдать? Endpoint POST /api/v1/time-entries/start, создающий запись со started_at и status=active.

Критерии  
Когда готово? Создаётся активная запись времени.

Задача: Создай endpoint POST /api/v1/time-entries/start для backend VibeBoard. Принимай task_id и создавай активную запись времени с started_at и status active.

---

## 69. Создать endpoint остановки time entry (done)

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? API endpoint завершения Pomodoro-сессии с расчётом duration.

Ограничения  
Чего НЕ делать? Не доверять duration с клиента — вычислять на сервере из started_at и ended_at.

Формат  
Как выдать? Endpoint POST /api/v1/time-entries/stop, заполняющий ended_at и duration_seconds.

Критерии  
Когда готово? ended_at и duration_seconds заполняются на сервере корректно.

Задача: Создай endpoint POST /api/v1/time-entries/stop для backend VibeBoard. Завершай активную запись времени, заполняй ended_at и duration_seconds.

---

## 70. Создать endpoint аналитики overview (done)

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? API endpoint базовой аналитики пользователя — агрегированные метрики продуктивности.

Ограничения  
Чего НЕ делать? Не вычислять тяжёлые агрегаты on the fly без индексов и кеша.

Формат  
Как выдать? Endpoint GET /api/v1/analytics/overview с метриками completed_tasks_count, total_tracked_time, streak.

Критерии  
Когда готово? Endpoint отдаёт корректную схему ответа с тремя метриками.

Задача: Создай endpoint GET /api/v1/analytics/overview для backend VibeBoard. Верни базовые метрики пользователя: completed_tasks_count, total_tracked_time и streak.

---

## 71. Подключить frontend login к authApi (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript)

Контекст  
Что пишем? Интеграцию UI login с backend — сохранение auth state и редирект после успешного входа.

Ограничения  
Чего НЕ делать? Не хранить токены небезопасно. Показывать ошибки API пользователю явно.

Формат  
Как выдать? Обновлённая страница login с вызовом authApi.login и обработкой ответа.

Критерии  
Когда готово? Login flow работает с backend. После входа — редирект на /dashboard.

Задача: Подключи login страницу VibeBoard к authApi. При успешном входе сохраняй auth state и перенаправляй пользователя на /dashboard.

---

## 72. Подключить frontend register к authApi (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript)

Контекст  
Что пишем? Интеграцию UI register с backend — отправка данных и редирект после успешной регистрации.

Ограничения  
Чего НЕ делать? Не показывать технические детали ошибок пользователю.

Формат  
Как выдать? Обновлённая страница register с вызовом authApi.register.

Критерии  
Когда готово? Register flow работает. После регистрации — редирект на onboarding или login.

Задача: Подключи страницу register VibeBoard к authApi. После успешной регистрации перенаправляй пользователя на onboarding или login.

---

## 73. Подключить dashboard к boardsApi (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript)

Контекст  
Что пишем? Замену mock data на реальные данные досок из backend.

Ограничения  
Чего НЕ делать? Не оставлять mock data в production коде. Реализовать loading state.

Формат  
Как выдать? Обновлённый dashboard с загрузкой досок через boardsApi.

Критерии  
Когда готово? Dashboard показывает данные с backend вместо mock data.

Задача: Подключи dashboard VibeBoard к boardsApi. Загружай список досок и отображай активную доску вместо mock data.

---

## 74. Подключить создание задачи к tasksApi (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript)

Контекст  
Что пишем? Интеграцию формы создания task с backend и оптимистичным обновлением UI.

Ограничения  
Чего НЕ делать? Не делать полную перезагрузку страницы. Реализовать error handling.

Формат  
Как выдать? Обновлённая форма создания задачи с вызовом tasksApi.createTask.

Критерии  
Когда готово? Новая задача появляется в колонке сразу после создания без перезагрузки.

Задача: Подключи создание задачи в dashboard VibeBoard к tasksApi. После успешного запроса добавляй новую задачу в UI без полной перезагрузки страницы.

---

## 75. Подключить moveTask к backend (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript)

Контекст  
Что пишем? Синхронизацию drag and drop с сервером — optimistic update и rollback при ошибке.

Ограничения  
Чего НЕ делать? Не блокировать UI во время запроса — использовать optimistic update.

Формат  
Как выдать? Обновлённая drag and drop логика с вызовом tasksApi.moveTask и rollback.

Критерии  
Когда готово? После перемещения задача обновляется и в UI, и на backend. При ошибке — rollback с уведомлением.

Задача: Подключи drag and drop задач в VibeBoard к tasksApi.moveTask. Сделай optimistic update и rollback при ошибке запроса.

---

## 76. Подключить таймер к time entries API (done)

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript)

Контекст  
Что пишем? Интеграцию Pomodoro timer с backend — создание и завершение сессий на сервере.

Ограничения  
Чего НЕ делать? Не полагаться только на local state для хранения активной сессии.

Формат  
Как выдать? Обновлённый блок таймера в TaskModal с вызовами time-entries API.

Критерии  
Когда готово? Кнопка Start создаёт time entry на сервере. Stop — завершает его.

Задача: Подключи Pomodoro timer в TaskModal VibeBoard к backend API time entries. Кнопка Start должна создавать time entry, Stop — завершать его.

---

## 77. Подключить Analytics page к analyticsApi

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript)

Контекст  
Что пишем? Замену mock значений на реальные метрики из backend.

Ограничения  
Чего НЕ делать? Не вычислять метрики на клиенте — только отображать данные с сервера.

Формат  
Как выдать? Обновлённая страница Analytics с вызовом analyticsApi.getOverview.

Критерии  
Когда готово? Метрики отображаются из API вместо mock values.

Задача: Подключи страницу Analytics VibeBoard к analyticsApi. Загружай overview-метрики с backend и отображай их вместо mock values.

---

## 78. Создать backend endpoint subscription status

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? API endpoint получения текущей подписки пользователя или workspace.

Ограничения  
Чего НЕ делать? Не возвращать Stripe secret data. Только план, статус и период.

Формат  
Как выдать? Endpoint GET /api/v1/billing/subscription с plan и billing status.

Критерии  
Когда готово? Endpoint возвращает current plan и billing status.

Задача: Создай endpoint GET /api/v1/billing/subscription для backend VibeBoard. Верни текущий план и billing status пользователя или workspace.

---

## 79. Создать backend endpoint Stripe checkout session

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python + Stripe)

Контекст  
Что пишем? API endpoint создания Stripe checkout session для перехода на платный план.

Ограничения  
Чего НЕ делать? Не использовать Stripe secret key на клиенте. Вся работа со Stripe — только на backend.

Формат  
Как выдать? Endpoint POST /api/v1/billing/checkout-session, возвращающий URL или session id.

Критерии  
Когда готово? Endpoint принимает plan и возвращает Stripe checkout URL или session id.

Задача: Создай endpoint POST /api/v1/billing/checkout-session для backend VibeBoard. Принимай plan и создавай Stripe checkout session. Верни URL или session id.

---

## 80. Создать backend endpoint Stripe webhook

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python + Stripe)

Контекст  
Что пишем? Обработчик webhook-событий Stripe с верификацией подписи и обновлением статуса подписки.

Ограничения  
Чего НЕ делать? Не обновлять subscription status без проверки подписи Stripe. Обработка должна быть идемпотентной.

Формат  
Как выдать? Endpoint POST /api/v1/billing/webhook с верификацией и обработкой событий.

Критерии  
Когда готово? Обработчик принимает событие, проверяет подпись и обновляет subscription status в базе.

Задача: Создай endpoint POST /api/v1/billing/webhook для backend VibeBoard. Проверяй подпись Stripe webhook и обновляй статус подписки в базе.

---

## 81. Подключить Billing page к billingApi

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript)

Контекст  
Что пишем? Интеграцию страницы billing с backend — отображение текущего плана и запуск checkout.

Ограничения  
Чего НЕ делать? Не вызывать Stripe напрямую с клиента. Только через billingApi.

Формат  
Как выдать? Обновлённая страница Billing с загрузкой подписки и checkout flow.

Критерии  
Когда готово? Кнопка Upgrade инициирует checkout flow через backend.

Задача: Подключи страницу Billing VibeBoard к billingApi. Загружай текущую подписку и запускай checkout flow по кнопке Upgrade.

---

## 82. Добавить backend-проверку лимита досок free плана

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? Серверную проверку feature gate — ограничение количества boards для free тарифа.

Ограничения  
Чего НЕ делать? Не полагаться только на клиентское скрытие кнопки. Проверка обязательна на сервере.

Формат  
Как выдать? Проверка лимита в endpoint создания board или в BoardService.

Критерии  
Когда готово? Free user получает business error при превышении лимита досок.

Задача: Добавь в backend VibeBoard серверную проверку лимита досок для free плана. Ограничение должно срабатывать в endpoint создания board.

---

## 83. Добавить backend-проверку recurring tasks только для платных планов

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? Серверную проверку feature gate — блокировку recurring_rule для free тарифа.

Ограничения  
Чего НЕ делать? Не обходить проверку на уровне API — только сервисный слой.

Формат  
Как выдать? Проверка в TaskService при create/update задачи с recurring_rule.

Критерии  
Когда готово? На free плане создание задачи с recurring_rule возвращает ошибку.

Задача: Добавь в backend VibeBoard проверку, что recurring tasks доступны только для платных планов. Блокируй create/update задачи с recurring_rule на free тарифе.

---

## 84. Добавить frontend-индикатор ограничений free плана

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript + Tailwind CSS)

Контекст  
Что пишем? Визуальные индикаторы premium restrictions прямо в интерфейсе — upgrade CTA вместо молчаливого скрытия.

Ограничения  
Чего НЕ делать? Не просто скрывать кнопки — показывать пользователю причину ограничения явно.

Формат  
Как выдать? Badge или upgrade CTA для recurring tasks, advanced analytics и premium themes.

Критерии  
Когда готово? Пользователь видит ограничение прямо в интерфейсе без необходимости читать FAQ.

Задача: Добавь во frontend VibeBoard индикаторы premium restrictions. Для recurring tasks, advanced analytics и premium themes покажи upgrade CTA вместо молчаливого скрытия.

---

## 85. Создать backend endpoint приглашения участника

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? API endpoint invite member в workspace с проверкой прав owner/admin.

Ограничения  
Чего НЕ делать? Не допускать приглашение участников без роли owner или admin.

Формат  
Как выдать? Endpoint POST /api/v1/workspaces/{workspace_id}/invite с принятием email и role.

Критерии  
Когда готово? Создаётся запись приглашения. Проверяются права отправителя.

Задача: Создай endpoint POST /api/v1/workspaces/{workspace_id}/invite для backend VibeBoard. Принимай email и role, проверяй права owner/admin и создавай запись приглашения.

---

## 86. Подключить Invite member на frontend

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript)

Контекст  
Что пишем? Интеграцию формы приглашения на Workspace page с backend endpoint.

Ограничения  
Чего НЕ делать? Не оставлять форму без success/error feedback.

Формат  
Как выдать? Обновлённая Workspace page с формой invite и toast-уведомлением после отправки.

Критерии  
Когда готово? После отправки показывается success notification.

Задача: Подключи форму Invite member в Workspace page VibeBoard к backend endpoint приглашения. После успешной отправки покажи success notification.

---

## 87. Добавить единый backend-формат ошибок

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? Централизованный формат API ошибок для единообразия всех ответов.

Ограничения  
Чего НЕ делать? Не возвращать stack traces клиенту. Не использовать разные форматы в разных router-ах.

Формат  
Как выдать? Exception handler и единая схема ответа с полями code, message, details.

Критерии  
Когда готово? Ошибки валидации и бизнес-ошибки возвращаются в одном формате.

Задача: Добавь в backend VibeBoard единый формат API ошибок с полями code, message и details. Подключи его к основным исключениям FastAPI.

---

## 88. Добавить frontend toast notifications

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript + Tailwind CSS)

Контекст  
Что пишем? Систему toast-уведомлений для success и error сообщений на уровне приложения.

Ограничения  
Чего НЕ делать? Не делать сложную систему — только success и error. Не блокировать UI модальным окном.

Формат  
Как выдать? Toast-компонент или провайдер с примером интеграции в login и create task.

Критерии  
Когда готово? Login, create task и ошибки API могут показывать уведомления.

Задача: Добавь в frontend VibeBoard простую систему toast notifications. Поддержи success и error уведомления и покажи пример интеграции с login и create task.

---

## 89. Добавить backend pagination для списка досок

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? Пагинацию в endpoint списка досок — limit/offset параметры.

Ограничения  
Чего НЕ делать? Не возвращать всю таблицу без ограничений.

Формат  
Как выдать? Обновлённый GET /api/v1/boards с параметрами limit и offset.

Критерии  
Когда готово? Endpoint принимает параметры и возвращает ограниченный список.

Задача: Добавь pagination в endpoint списка досок backend VibeBoard. Поддержи limit и offset и верни корректный ограниченный набор данных.

---

## 90. Добавить базовые frontend loading states

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript + Tailwind CSS)

Контекст  
Что пишем? UI-состояния загрузки для dashboard, analytics и billing — skeleton или loading placeholders.

Ограничения  
Чего НЕ делать? Не блокировать весь экран спиннером — использовать inline placeholders.

Формат  
Как выдать? Loading состояния в dashboard, analytics и billing страницах.

Критерии  
Когда готово? Во время запроса пользователь видит понятное состояние загрузки.

Задача: Добавь базовые loading states во frontend VibeBoard для dashboard, analytics и billing. Используй простые skeleton или loading placeholders.

---

## 91. Добавить базовые frontend empty states

Роль  
Кто пишет? Senior Frontend Developer (React + TypeScript + Tailwind CSS)

Контекст  
Что пишем? UI для пустых данных — подсказки пользователю о следующем шаге.

Ограничения  
Чего НЕ делать? Не оставлять пустые белые блоки без объяснения. Показывать CTA или инструкцию.

Формат  
Как выдать? Empty state для пустой доски, нет задач в календаре и пустого списка участников.

Критерии  
Когда готово? Empty state помогает пользователю понять следующий шаг.

Задача: Добавь empty states во frontend VibeBoard для пустой доски, отсутствия задач в календаре и пустого списка участников workspace.

---

## 92. Создать backend healthcheck для БД

Роль  
Кто пишет? Senior Backend Developer (FastAPI + Python)

Контекст  
Что пишем? Расширение health endpoint проверкой доступности PostgreSQL.

Ограничения  
Чего НЕ делать? Не делать тяжёлый запрос к базе — только простейшая проверка соединения.

Формат  
Как выдать? Обновлённый health endpoint, показывающий статус app и database.

Критерии  
Когда готово? Endpoint показывает статус app и database.

Задача: Расширь backend health endpoint в VibeBoard. Добавь проверку доступности PostgreSQL и возвращай статус app и database.

---

## 93. Добавить Dockerfile для backend

Роль  
Кто пишет? DevOps / Senior Backend Developer

Контекст  
Что пишем? Контейнеризацию FastAPI backend-сервиса.

Ограничения  
Чего НЕ делать? Не добавлять лишние слои. Минимальный рабочий Dockerfile.

Формат  
Как выдать? Dockerfile для backend VibeBoard.

Критерии  
Когда готово? Контейнер стартует локально.

Задача: Создай Dockerfile для backend VibeBoard на FastAPI. Сделай минимальную рабочую конфигурацию для локального запуска в контейнере.

---

## 94. Добавить Dockerfile для frontend

Роль  
Кто пишет? DevOps / Senior Frontend Developer

Контекст  
Что пишем? Контейнеризацию React SPA.

Ограничения  
Чего НЕ делать? Не хранить секреты в образе. Минимальная конфигурация.

Формат  
Как выдать? Dockerfile для frontend VibeBoard.

Критерии  
Когда готово? Контейнер frontend стартует локально.

Задача: Создай Dockerfile для frontend VibeBoard на React + TypeScript. Сделай минимальную рабочую конфигурацию для локального запуска.

---

## 95. Добавить базовый docker-compose

Роль  
Кто пишет? DevOps / Senior Developer

Контекст  
Что пишем? Локальную среду разработки с поднятием всех основных сервисов одной командой.

Ограничения  
Чего НЕ делать? Не добавлять production конфигурацию. Только локальная разработка.

Формат  
Как выдать? docker-compose.yml с сервисами frontend, backend и postgres.

Критерии  
Когда готово? docker-compose up запускает все основные сервисы.

Задача: Создай базовый docker-compose.yml для VibeBoard с сервисами frontend, backend и postgres. Сделай конфигурацию пригодной для локальной разработки.

---

## 96. Добавить backend тест регистрации

Роль  
Кто пишет? Senior Backend Developer (Python + pytest)

Контекст  
Что пишем? Backend тест успешной регистрации пользователя.

Ограничения  
Чего НЕ делать? Не мокать базу данных — использовать тестовую БД или in-memory аналог.

Формат  
Как выдать? Тест для endpoint регистрации с проверкой ответа и создания записи.

Критерии  
Когда готово? Тест проходит.

Задача: Напиши backend тест для endpoint регистрации в VibeBoard. Проверь успешное создание пользователя и корректный response.

---

## 97. Добавить backend тест логина

Роль  
Кто пишет? Senior Backend Developer (Python + pytest)

Контекст  
Что пишем? Backend тест успешного входа пользователя с проверкой выдачи токена.

Ограничения  
Чего НЕ делать? Не мокать логику верификации пароля.

Формат  
Как выдать? Тест для endpoint логина с проверкой наличия access token в ответе.

Критерии  
Когда готово? Тест проходит.

Задача: Напиши backend тест для endpoint логина в VibeBoard. Проверь успешную авторизацию и наличие access token в ответе.

---

## 98. Добавить frontend тест login form

Роль  
Кто пишет? Senior Frontend Developer (React + Testing Library)

Контекст  
Что пишем? Frontend тест UI-формы входа — рендер и базовая валидация.

Ограничения  
Чего НЕ делать? Не тестировать API-запросы — только UI поведение.

Формат  
Как выдать? Тест страницы login с проверкой рендера и валидации пустых полей.

Критерии  
Когда готово? Тест проходит.

Задача: Напиши frontend тест для страницы login в VibeBoard. Проверь рендер формы и базовую валидацию пустых полей.

---

## 99. Добавить frontend тест TaskCard

Роль  
Кто пишет? Senior Frontend Developer (React + Testing Library)

Контекст  
Что пишем? Frontend тест компонента TaskCard — проверка отображения ключевых данных.

Ограничения  
Чего НЕ делать? Не тестировать стили или позиционирование. Только наличие контента.

Формат  
Как выдать? Тест компонента TaskCard с проверкой title, priority и due date.

Критерии  
Когда готово? Тест проходит.

Задача: Напиши frontend тест для компонента TaskCard в VibeBoard. Проверь, что корректно отображаются title, priority и due date.

---

## 100. Добавить README по запуску проекта

Роль  
Кто пишет? Senior Developer / Technical Writer

Контекст  
Что пишем? Краткую инструкцию по запуску проекта — для нового разработчика, который только клонировал репозиторий.

Ограничения  
Чего НЕ делать? Не писать длинную документацию. Только необходимый минимум для запуска.

Формат  
Как выдать? README.md с секциями: env настройка, локальный запуск frontend и backend, запуск через docker-compose.

Критерии  
Когда готово? Новый разработчик может быстро поднять проект по инструкции без вопросов.

Задача: Создай README для проекта VibeBoard с инструкцией по локальному запуску frontend и backend, настройке env и запуску через docker-compose.
