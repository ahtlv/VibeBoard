# Backend

## Stack

- **Runtime**: Cloudflare Workers (через Wrangler)
- **Framework**: Hono v4 + TypeScript
- **Database / Auth**: Supabase (`@supabase/supabase-js` с service key — обходит RLS)
- **Auth**: Supabase Auth JWT, верификация через JWKS (`jose`)
- **Validation**: Zod
- **Payments**: Stripe SDK
- **Local dev**: `@hono/node-server` (порт 8787 по умолчанию)

## Структура

```
src/
├── index.ts          # точка входа: регистрация роутов, CORS, глобальные обработчики
├── server.ts         # local dev entrypoint (node-server обёртка)
├── types.ts          # AppEnv (Bindings + Variables), DbUser
├── routes/           # один файл = один ресурс (auth, boards, columns, tasks, ...)
├── middleware/
│   └── auth.ts       # authMiddleware: проверка JWT через JWKS, пишет userId/user в context
└── lib/
    ├── supabase.ts   # getSupabase(env) — инициализация клиента
    └── access.ts     # хелперы проверки доступа к ресурсам
```

## Правила написания кода

**Аутентификация**: защищённые роуты всегда используют `authMiddleware`. После middleware `c.get('userId')` и `c.get('user')` гарантированно заполнены.

**Supabase client**: получать через `getSupabase(c.env)`, не создавать напрямую. Service key обходит RLS — проверки доступа писать явно в коде (через `lib/access.ts`).

**Валидация**: все входные данные парсить через Zod. Не доверять TypeScript-типам от клиента.

**Ответы**: `c.json(data)` для 200, `c.json({ error: 'сообщение' }, код)` для ошибок. Не раскрывать детали внутренних ошибок клиенту.

**Feature gates**: проверять план пользователя (`c.get('user').plan`) перед операциями, ограниченными тарифом. Нельзя полагаться только на UI.

**Stripe webhook**: всегда проверять подпись через `stripe.webhooks.constructEvent`. Обрабатывать идемпотентно.

**Новый роут**: создать файл в `src/routes/<resource>.ts`, зарегистрировать в `src/index.ts`.

## Команды

```bash
npm run dev       # локальный сервер на http://localhost:8787
npm run deploy    # деплой на Cloudflare Workers
npm run typecheck # проверка типов без сборки
```

## Env

Переменные через `c.env.VAR_NAME` (Cloudflare Bindings):
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `FRONTEND_URL`

Для локального dev — через `server.ts` из `process.env`.
