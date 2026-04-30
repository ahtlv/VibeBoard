# Changelog — 30 апреля 2026

## Мультиязычность (RU / EN)

Добавлена полная поддержка интернационализации на базе `i18next + react-i18next`.

### Что изменилось для пользователя

- Интерфейс по умолчанию на **русском языке** — короткие телеграфные фразы
- Переключатель **RU / EN** в хедере рядом с переключателем темы — на всех экранах (включая login / register)
- Выбор языка **сохраняется в БД** (`users.settings_language`) для авторизованных пользователей
- При логине язык автоматически подтягивается из профиля
- До логина — язык из `localStorage`

### Новые файлы фронтенда

- `shared/i18n/index.ts` — инициализация i18next
- `shared/i18n/locales/ru.json` — русские переводы (nav, auth, settings, billing, analytics, workspace, calendar, dashboard, onboarding)
- `shared/i18n/locales/en.json` — английские переводы
- `app/providers/LanguageProvider.tsx` — контекст языка
- `shared/ui/LanguageToggle.tsx` — кнопка переключения

### Изменённые страницы

Все UI-строки заменены на `t()`: login, register, settings, onboarding, billing, analytics, workspace, calendar, dashboard, AppShell.

### Новый бэкенд-эндпоинт

`PATCH /api/v1/users/me/settings` — обновляет `language`, `theme`, `email_notifications`, `desktop_notifications`. Валидация через Zod.

### Закрытый TODO

Settings → Notifications: переключатели email/desktop уведомлений теперь реально сохраняются в БД через `usersApi.updateSettings`.

---

## InviteMembersModal — правки UX

- `onInvite` стал асинхронным (`Promise<string | null>`) — ошибки инвайта теперь показываются в форме, а не игнорируются
- Добавлен `inviting`-стейт, кнопка блокируется на время запроса
