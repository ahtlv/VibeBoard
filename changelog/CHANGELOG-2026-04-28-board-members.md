# Changelog — 28 апреля 2026 — Board Members

## Обзор

Полный цикл функционала управления участниками досок: UI-компоненты, бэкенд-эндпоинты, таблица в Supabase, поиск пользователей с autocomplete.

---

## База данных — Supabase

### Новая таблица `board_members`

```sql
board_members (
  id          UUID PRIMARY KEY,
  board_id    UUID NOT NULL → boards.id CASCADE,
  user_id     UUID → users.id CASCADE (null для pending-инвайтов),
  email       VARCHAR NOT NULL,
  role        VARCHAR CHECK ('owner' | 'admin' | 'member') DEFAULT 'member',
  status      VARCHAR CHECK ('active' | 'pending') DEFAULT 'active',
  invited_by  UUID → users.id,
  joined_at   TIMESTAMPTZ DEFAULT now()
)
```

- `UNIQUE (board_id, user_id)` — один юзер не может быть дважды на одном борде
- `UNIQUE (board_id, email)` — один email не может быть дважды на одном борде
- RLS включён с 4 политиками: SELECT / INSERT / UPDATE / DELETE по workspace-членству

---

## Backend — TypeScript (`backend-ts`)

### Новые эндпоинты board members (`/api/v1/boards/:id/members`)

| Метод | URL | Описание |
|-------|-----|----------|
| `GET` | `/boards/:id/members` | Список участников с JOIN на `users` (name, avatar_url) |
| `POST` | `/boards/:id/members` | Добавить участника по email; `status=active` если юзер найден в `users`, иначе `pending` |
| `PATCH` | `/boards/:id/members/:memberId` | Сменить роль (`admin` / `member`) |
| `DELETE` | `/boards/:id/members/:memberId` | Удалить участника |

Все эндпоинты проверяют workspace-членство через `getBoardWorkspace` + `isMember`.

### Новый эндпоинт поиска пользователей (`/api/v1/users/search`)

- `GET /users/search?q=` — поиск по `email` через `ILIKE '%q%'`
- Требует минимум 2 символа, возвращает максимум 8 результатов
- Требует авторизацию (Bearer JWT)
- Новый файл: `backend-ts/src/routes/users.ts`
- Зарегистрирован в `backend-ts/src/index.ts`

---

## Frontend — React

### Новые компоненты

#### `shared/ui/Modal.tsx`
Вынесен переиспользуемый `ModalOverlay` из `BoardNav.tsx`. Поддерживает prop `wide` (max-w-md вместо max-w-sm).

#### `shared/ui/Avatar.tsx`
Компонент аватара с инициалами. Поддерживает размеры `sm / md / lg` и `avatarUrl`. Утилита `initials(name)` вынесена сюда.

#### `widgets/InviteMembersModal.tsx`
Модалка управления участниками борда:
- Форма инвайта по email с **autocomplete-дропдауном** (debounce 250ms, запрос к `/users/search`)
- Выбор роли (`admin` / `member`)
- Список активных участников с аватаром, ролью, кнопкой удаления
- Секция pending-инвайтов (приглушено, подпись "invited")
- Владелец (owner) защищён: нельзя удалить и нельзя поменять роль

#### `widgets/BoardMembersStack.tsx`
Стек аватаров в хедере борда:
- Показывает до 4 аватаров с overlap (`-ml-2`, ring-обводка)
- Overflow: "+N" при > 4 участников
- Кнопка `+` (пунктирный кружок) для открытия `InviteMembersModal`
- Клик по стеку тоже открывает модалку

### Обновлённые компоненты

#### `widgets/BoardHeader.tsx`
Добавлен `BoardMembersStack` справа через `flex justify-between`. Новые props: `members`, `onInvite`, `onRemove`, `onChangeRole`.

#### `shared/ui/BoardNav.tsx` — `CreateBoardModal`
Секция **Add members** при создании борда:
- Загружает workspace-участников через `workspacesApi.listMembers`
- Показывает их как кликабельные чипы (avatar + имя, indigo-подсветка при выборе)
- Email-инпут с **autocomplete-дропдауном** — при вводе 2+ символов запрашивает `/users/search`, показывает карточки с аватаром и именем
- Выбор роли для каждого invite
- Pending-инвайты отображаются как amber-теги с крестиком
- Если workspace пустой — сразу открыта форма инвайта
- Выбранные участники записываются в `boardMembersStore` при создании борда

### Новые API-клиенты

#### `shared/api/boardMembersApi.ts`
```ts
boardMembersApi.list(boardId)
boardMembersApi.add(boardId, email, role)
boardMembersApi.updateRole(boardId, memberId, role)
boardMembersApi.remove(boardId, memberId)
```

#### `shared/api/usersApi.ts`
```ts
usersApi.search(q)  // → UserSearchResult[]
```

### Новые вспомогательные файлы

#### `shared/lib/boardMembersStore.ts`
Временный in-memory store для предзаполнения участников при создании борда. `DashboardPage` читает при первой загрузке и очищает (`consume`). Будет удалён когда бэкенд начнёт возвращать members в ответе `POST /boards`.

### Изменения в `DashboardPage`

- State `members: BoardMember[]` — участники текущего борда
- При загрузке борда: параллельный запрос `boardsApi.getBoard` + `boardMembersApi.list`
- Обработчики `handleInviteMember`, `handleRemoveMember`, `handleChangeMemberRole` — вызывают реальный API с оптимистичным обновлением и rollback при ошибке
- Убраны `mockBoardMembers()` — данные только из Supabase

---

## Инфраструктура

### Удалён Python backend и Redis

- Удалена папка `backend/` (FastAPI)
- Из `docker-compose.yml` убраны сервисы `backend` (Python) и `redis`
- Убрано поле `version` (deprecated в Compose v2)
- Активный стек: только `backend-ts` (Hono/TypeScript на порту 8787) + `frontend` (nginx на порту 3000)

---

## Архитектурные решения

- **Бэкенд использует service key** — RLS обходится, авторизация делается вручную через `isMember()`
- **user_id nullable** — поддержка pending-инвайтов для незарегистрированных пользователей
- **Autocomplete через onBlur+setTimeout** — предотвращает закрытие дропдауна до срабатывания `onMouseDown` на пункте списка
- **Оптимистичные обновления** с rollback через повторный `boardMembersApi.list()` при ошибке сети
