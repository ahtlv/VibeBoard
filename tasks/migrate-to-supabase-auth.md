# Задача: Миграция с кастомного auth на Supabase Auth

## Контекст проекта

VibeBoard — SaaS kanban-приложение. Стек: React + TypeScript (frontend), FastAPI + Python (backend), PostgreSQL через Supabase.

Сейчас используется полностью кастомный auth: собственные JWT (HS256), bcrypt-пароли, кастомная email-верификация с токенами. Нужно перейти на Supabase Auth — это даст нативную отправку confirmation-писем, готовый OAuth, управление сессиями.

**Важно:** Supabase используется только как PostgreSQL (DATABASE_URL). Supabase Auth ещё не подключён ни в backend, ни в frontend. Это миграция с нуля.

---

## Текущая архитектура (что есть сейчас)

### Backend файлы которые будут изменены или удалены:

- `backend/app/routers/auth.py` — эндпоинты `/register`, `/login`, `/verify-email`
- `backend/app/services/auth.py` — AuthService с register/login/verify_email
- `backend/app/repositories/user.py` — UserRepository с get_by_verification_token_hash, create с password_hash
- `backend/app/models/user.py` — User модель с полями: `password_hash`, `email_verified_at`, `email_verification_token_hash`, `email_verification_sent_at`
- `backend/app/core/security.py` — `hash_password`, `verify_password`, `create_access_token`, `decode_access_token` (HS256 JWT)
- `backend/app/core/deps.py` — `get_current_user` декодирует собственный JWT через `decode_access_token`
- `backend/app/core/config.py` — настройки: `JWT_SECRET`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `SMTP_*`, `EMAIL_FROM`, `EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS`
- `backend/app/schemas/auth.py` — схемы: `RegisterRequest`, `LoginRequest`, `LoginResponse`, `RegisterPendingResponse`, `VerifyEmailResponse`, `UserResponse`
- `backend/app/integrations/email_client.py` — кастомный SMTP клиент (полностью удаляется)

### Frontend файлы которые будут изменены или удалены:

- `frontend/src/features/auth/store.tsx` — AuthProvider хранит `accessToken` в localStorage под ключом `vb_access_token`, `status: 'idle' | 'authenticated' | 'unauthenticated'`
- `frontend/src/shared/api/authApi.ts` — `login`, `register`, `verifyEmail`, `getMe`, `refreshToken`, `logout`
- `frontend/src/shared/api/client.ts` — использует `setTokenAccessor` для инжекта токена
- `frontend/src/pages/register/index.tsx` — форма с name/email/password/confirmPassword, после регистрации показывает "Check your email" + dev_verification_url блок
- `frontend/src/pages/login/index.tsx` — форма email/password
- `frontend/src/pages/verify-email/index.tsx` — ловит `?token=` из URL, вызывает `authApi.verifyEmail(token)`, сохраняет auth, редиректит на `/onboarding`
- `frontend/src/app/router/index.tsx` — маршруты: `/login`, `/register`, `/verify-email` (публичные), остальные через `ProtectedRoute`
- `frontend/src/app/router/ProtectedRoute.tsx` — проверяет `status === 'authenticated'`

---

## Целевое состояние после миграции

### Принцип работы

1. Регистрация: frontend вызывает `supabase.auth.signUp({ email, password, options: { data: { name } } })` → Supabase создаёт юзера в `auth.users` → автоматически шлёт confirmation email со ссылкой вида `https://your-site.com/auth/callback?token_hash=...&type=signup` → Postgres-триггер создаёт запись в `public.users`
2. Подтверждение email: пользователь кликает ссылку → попадает на `/auth/callback` в нашем SPA → frontend вызывает `supabase.auth.exchangeCodeForSession(code)` → получает сессию → редиректит на `/onboarding`
3. Логин: `supabase.auth.signInWithPassword({ email, password })` → получаем session с `access_token` (Supabase JWT)
4. Backend auth: `get_current_user` в deps.py проверяет Supabase JWT (RS256) через Supabase JWKS endpoint, извлекает `sub` (UUID из `auth.users`), загружает юзера из `public.users` по этому UUID
5. Синхронизация users: Postgres-триггер на `auth.users` автоматически создаёт/обновляет `public.users`

### Supabase Dashboard настройки (сделать вручную до начала кода)

В Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: `http://localhost:5173` (dev) / production URL при деплое
- **Redirect URLs**: добавить `http://localhost:5173/auth/callback`

В Supabase Dashboard → Authentication → Email Templates:
- Убедиться что Confirmation email включён, ссылка ведёт на Site URL + `/auth/callback`

В Supabase Dashboard → Project Settings → API:
- Скопировать `Project URL` → нужен как `SUPABASE_URL`
- Скопировать `anon public key` → нужен как `SUPABASE_ANON_KEY`
- Скопировать `JWT Secret` → нужен как `SUPABASE_JWT_SECRET` для backend верификации

---

## Пошаговый план реализации

### Шаг 1: База данных — Postgres-триггер для синхронизации users

Применить SQL-миграцию через Supabase MCP (`mcp__supabase__apply_migration`):

```sql
-- Триггерная функция: при создании юзера в auth.users создаём запись в public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Привязываем триггер к auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

Также миграция для очистки модели `public.users` — убрать поля кастомного auth:

```sql
ALTER TABLE public.users
  DROP COLUMN IF EXISTS password_hash,
  DROP COLUMN IF EXISTS email_verified_at,
  DROP COLUMN IF EXISTS email_verification_token_hash,
  DROP COLUMN IF EXISTS email_verification_sent_at;
```

### Шаг 2: Backend — обновить конфиг

`backend/app/core/config.py` — убрать старые настройки, добавить Supabase:

Убрать: `JWT_SECRET`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_DAYS`, `EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS`, `EMAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_USE_TLS`

Добавить:
```python
SUPABASE_URL: str = ""          # https://xxx.supabase.co
SUPABASE_JWT_SECRET: str = ""   # JWT Secret из Project Settings → API
```

### Шаг 3: Backend — новый `get_current_user` в deps.py

Заменить декодирование кастомного HS256 JWT на верификацию Supabase JWT (HS256 с SUPABASE_JWT_SECRET):

```python
# Supabase использует HS256, секрет — SUPABASE_JWT_SECRET из настроек проекта
from jose import jwt, JWTError

async def get_current_user(...):
    payload = jwt.decode(
        credentials.credentials,
        settings.SUPABASE_JWT_SECRET,
        algorithms=["HS256"],
        audience="authenticated",
    )
    user_id = uuid.UUID(payload["sub"])
    # загружаем из public.users по этому UUID
```

### Шаг 4: Backend — удалить файлы кастомного auth

Удалить полностью:
- `backend/app/integrations/email_client.py`
- `backend/app/services/auth.py`
- `backend/app/core/security.py`

Упростить `backend/app/repositories/user.py`:
- Убрать `get_by_verification_token_hash`
- Убрать параметры `password_hash`, `email_verification_*` из метода `create`
- Метод `create` больше не нужен (юзеры создаются триггером) — можно оставить только `get_by_id` и `get_by_email`

Упростить `backend/app/routers/auth.py`:
- Убрать эндпоинты `/register`, `/login`, `/verify-email` — они больше не нужны, всё делает Supabase
- Оставить только `/me` (GET текущего пользователя по токену) если он там есть, или перенести в `/users/me`

Упростить `backend/app/models/user.py`:
- Убрать поля: `password_hash`, `email_verified_at`, `email_verification_token_hash`, `email_verification_sent_at`

Упростить `backend/app/schemas/auth.py`:
- Убрать: `RegisterRequest`, `LoginRequest`, `RegisterPendingResponse`, `VerifyEmailResponse`, `LoginResponse`, `TokenResponse`
- Оставить только `UserResponse` (и `UserSettingsResponse`)

### Шаг 5: Frontend — установить supabase-js

```bash
cd frontend && npm install @supabase/supabase-js
```

### Шаг 6: Frontend — создать Supabase клиент

Создать `frontend/src/shared/api/supabaseClient.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

Добавить в `frontend/.env` (и `.env.example`):
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Шаг 7: Frontend — переписать auth store

`frontend/src/features/auth/store.tsx` — заменить на Supabase-сессию:

- Убрать ручное хранение токена в localStorage (Supabase сам управляет сессией)
- `status: 'idle'` пока `supabase.auth.getSession()` не вернул результат
- `status: 'authenticated'` если есть активная сессия
- `status: 'unauthenticated'` если сессии нет
- Подписаться на `supabase.auth.onAuthStateChange` для реактивного обновления
- `setTokenAccessor` в apiClient должен возвращать `session.access_token` из Supabase

Сигнатура `setAuth` больше не нужна — состояние определяется автоматически через `onAuthStateChange`.

### Шаг 8: Frontend — переписать authApi.ts

Убрать кастомные методы, заменить на Supabase:

```typescript
export const authApi = {
  register: (email: string, password: string, name: string) =>
    supabase.auth.signUp({ email, password, options: { data: { name } } }),

  login: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  logout: () => supabase.auth.signOut(),

  getSession: () => supabase.auth.getSession(),
}
```

Метод `verifyEmail` и `refreshToken` — удалить (Supabase делает сам).
Метод `getMe` — оставить если нужна загрузка профиля из `public.users` через FastAPI.

### Шаг 9: Frontend — переписать страницу регистрации

`frontend/src/pages/register/index.tsx`:
- Форма остаётся: `name`, `email`, `password`, `confirmPassword`
- `handleSubmit` → вызывает `authApi.register(email, password, name)` (supabase.auth.signUp)
- После успеха — показывает "Check your email" (без dev_verification_url блока)
- Если `data.session` не null сразу (email confirmation отключён в Supabase) — редиректить на `/onboarding`
- Обработать ошибку `User already registered` от Supabase → показать "Email уже занят"

### Шаг 10: Frontend — переписать страницу логина

`frontend/src/pages/login/index.tsx`:
- `handleSubmit` → вызывает `authApi.login(email, password)` (supabase.auth.signInWithPassword)
- Supabase сам обновляет сессию → `onAuthStateChange` срабатывает → auth store обновляется → ProtectedRoute пускает внутрь
- Обработать ошибки: `Invalid login credentials` → "Неверный email или пароль", `Email not confirmed` → "Подтвердите email"

### Шаг 11: Frontend — создать страницу `/auth/callback`

Создать `frontend/src/pages/auth-callback/index.tsx`:

Эта страница обрабатывает редирект после клика на ссылку в письме:

```typescript
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/shared/api/supabaseClient'

export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/onboarding', { replace: true })
      } else if (event === 'TOKEN_REFRESHED') {
        navigate('/dashboard', { replace: true })
      }
    })
  }, [navigate])

  // Показать спиннер пока обрабатывается
  return <div>Confirming your email…</div>
}
```

Добавить роут в `frontend/src/app/router/index.tsx`:
```tsx
<Route path="/auth/callback" element={<AuthCallbackPage />} />
```

### Шаг 12: Frontend — удалить старую verify-email страницу

`frontend/src/pages/verify-email/index.tsx` — удалить файл.
Убрать маршрут `/verify-email` из router.
Убрать экспорт `VerifyEmailPage` из `frontend/src/pages/index.ts`.

### Шаг 13: Frontend — обновить ProtectedRoute

`frontend/src/app/router/ProtectedRoute.tsx` — логика остаётся той же (`status === 'idle'` → null, `unauthenticated` → редирект на `/login`). Меняется только то как `status` определяется (через Supabase session вместо localStorage токена).

### Шаг 14: Backend .env

Добавить в `backend/.env` (или корневой `.env`):
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase-dashboard
```

Убрать:
```
# JWT_SECRET — больше не используется
# SMTP_* — больше не используется
```

---

## Файлы: итоговая судьба

| Файл | Действие |
|------|----------|
| `backend/app/integrations/email_client.py` | Удалить |
| `backend/app/services/auth.py` | Удалить |
| `backend/app/core/security.py` | Удалить |
| `backend/app/routers/auth.py` | Переписать (убрать register/login/verify, оставить /me если есть) |
| `backend/app/core/deps.py` | Переписать get_current_user под Supabase JWT |
| `backend/app/core/config.py` | Убрать SMTP/JWT настройки, добавить SUPABASE_URL + SUPABASE_JWT_SECRET |
| `backend/app/models/user.py` | Убрать 4 поля кастомного auth |
| `backend/app/repositories/user.py` | Убрать get_by_verification_token_hash и create |
| `backend/app/schemas/auth.py` | Убрать все схемы кроме UserResponse |
| `frontend/src/pages/verify-email/index.tsx` | Удалить |
| `frontend/src/pages/auth-callback/index.tsx` | Создать новый |
| `frontend/src/features/auth/store.tsx` | Переписать под Supabase session |
| `frontend/src/shared/api/authApi.ts` | Переписать под supabase-js |
| `frontend/src/shared/api/supabaseClient.ts` | Создать новый |
| `frontend/src/pages/register/index.tsx` | Обновить handleSubmit |
| `frontend/src/pages/login/index.tsx` | Обновить handleSubmit |
| `frontend/src/app/router/index.tsx` | Добавить /auth/callback, убрать /verify-email |
| `frontend/src/app/router/ProtectedRoute.tsx` | Логика та же, источник статуса меняется |

---

## Зависимости к установке

Backend:
```
# Убрать из requirements: bcrypt, python-jose (если не используются в других местах)
# Добавить: PyJWT (для верификации Supabase JWT если jose убирается)
# Или оставить jose и использовать его для Supabase JWT верификации
```

Frontend:
```bash
npm install @supabase/supabase-js
# Убрать если не нужны: нет прямых зависимостей которые надо удалять
```

---

## Критерии успеха

1. Регистрация нового пользователя → на email приходит письмо от Supabase со ссылкой вида `https://xxx.supabase.co/auth/v1/verify?token=...&redirect_to=http://localhost:5173/auth/callback`
2. Клик по ссылке → попадаем на `/auth/callback` в SPA → авто-редирект на `/onboarding`
3. Логин → работает, попадаем в `/dashboard`
4. Refresh страницы → сессия восстанавливается (Supabase хранит в localStorage/cookies сам)
5. Backend защищённые эндпоинты → принимают Supabase JWT в `Authorization: Bearer`
6. `public.users` запись создаётся автоматически при регистрации через триггер
7. Старые тесты (`test_auth_register.py`, `test_auth_login.py`) — обновить или удалить, написать новые smoke-тесты

---

## Возможные подводные камни

1. **Supabase JWT формат**: Supabase использует HS256 с `SUPABASE_JWT_SECRET`. Audience в payload = `"authenticated"`. При декодировании в backend нужно указывать `audience="authenticated"` иначе jose выбросит ошибку.

2. **Триггер и существующие пользователи**: Если в `public.users` уже есть записи с паролями — они останутся. Нужно либо очистить таблицу, либо триггер с `ON CONFLICT DO UPDATE` (уже учтено в SQL выше).

3. **Email confirmation в Supabase**: По умолчанию включено. В Supabase Dashboard → Authentication → можно отключить для разработки (Confirm email = false) — тогда `signUp` сразу вернёт сессию без письма.

4. **PKCE flow**: Supabase по умолчанию использует PKCE для web. Callback URL должен обрабатывать `code` параметр, не `token`. `supabase.auth.onAuthStateChange` автоматически обменяет code на сессию при загрузке `/auth/callback`.

5. **ProtectedRoute idle state**: После перехода на Supabase `status: 'idle'` должен разрешаться после `supabase.auth.getSession()` на маунте. До этого рендерим `null` или спиннер — иначе будет мгновенный редирект на `/login`.
