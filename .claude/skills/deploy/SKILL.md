# Deploy

Деплой VibeBoard в продакшен на Cloudflare Workers.

## Команды

```bash
# Из папки backend-ts/
sh build.sh        # собирает фронт + бекенд, копирует dist в public/
npx wrangler deploy  # деплоит воркер на Cloudflare
```

## Что делает build.sh

1. `npm ci` + `npm run build` во `frontend/` с `VITE_API_URL=/api/v1`
2. Копирует `frontend/dist/*` → `backend-ts/public/`
3. `npm ci` в `backend-ts/`
4. Если есть `$SUPABASE_SERVICE_KEY` в env — пушит его как Wrangler secret

## Prod URL

https://vibeboard.6150159.workers.dev

## Важно

- `SUPABASE_SERVICE_KEY` хранится как Wrangler secret (не в `wrangler.toml`).
  Если нужно обновить: `echo "sk_..." | npx wrangler secret put SUPABASE_SERVICE_KEY`
- Остальные переменные (`SUPABASE_URL`, `FRONTEND_URL`) — в `wrangler.toml` в секции `[vars]`
- Фронт и бекенд живут в одном воркере — фронт раздаётся как static assets через `[assets]`
