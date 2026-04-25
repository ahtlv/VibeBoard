# Задача: Полноценный Invite Flow в воркспейс

## Контекст

Сейчас `POST /workspaces/:id/invite` создаёт запись в таблице `invitations` (с токеном и TTL 7 дней), но на этом всё заканчивается — письмо не отправляется, принять инвайт невозможно, удалить участника тоже нельзя. Пользователей приходится добавлять вручную через SQL. Нужно замкнуть весь цикл: **invite → email → accept → member**.

---

## Файлы для создания / изменения

**Backend:**
- `backend/app/routers/workspace.py` — добавить эндпоинты members/invitations
- `backend/app/routers/invitation.py` — новый файл, accept эндпоинт
- `backend/app/services/workspace.py` — методы accept_invite, remove_member
- `backend/app/repositories/invitation.py` — get_by_token, mark_accepted
- `backend/app/repositories/workspace.py` — add_member, remove_member
- `backend/app/schemas/workspace.py` — новые схемы
- `backend/app/integrations/email_client.py` — воссоздать для инвайтов
- `backend/app/main.py` — зарегистрировать новый роутер

**Frontend:**
- `frontend/src/pages/workspace/index.tsx` — фикс роли, реальный remove, pending-инвайты
- `frontend/src/pages/accept-invite/index.tsx` — новая страница
- `frontend/src/app/router/index.tsx` — маршрут `/invitations/accept`
- `frontend/src/pages/index.ts` — экспорт новой страницы
- `frontend/src/shared/api/workspacesApi.ts` — новые API методы

---

## Что нужно реализовать

### Backend

#### 1. Email при инвайте
В `WorkspaceService.invite_member` после создания invitation вызывать:
```python
send_invitation_email(
    to_email=email,
    inviter_name=inviter.name,
    workspace_name=workspace.name,
    accept_url=f"{settings.FRONTEND_URL}/invitations/accept?token={invitation.token}"
)
```
В dev — просто логировать ссылку (`logger.info("Invite URL: %s", accept_url)`).
В prod — отправлять через SMTP (те же настройки что были).

#### 2. Accept эндпоинт (публичный, без авторизации)
```
POST /api/v1/invitations/accept
Body: { token: str }
```
Логика:
1. Найти invitation по токену → 404 если нет
2. Проверить `status == 'pending'` и `expires_at > now()` → 410 Gone если истёк
3. Найти юзера по email из invitation → 404 с detail `"Register first"` если не существует
4. Если юзер уже member → 409
5. Создать `WorkspaceMember(workspace_id, user_id, role=invitation.role)`
6. Обновить `invitation.status = 'accepted'`
7. Вернуть `WorkspaceMemberResponse`

Файл: `backend/app/routers/invitation.py`, зарегистрировать в `main.py`.

#### 3. Список pending-инвайтов
```
GET /api/v1/workspaces/{workspace_id}/invitations
```
Только для owner/admin. Возвращает `list[InvitationResponse]` со статусом `pending`.

#### 4. Отозвать инвайт
```
DELETE /api/v1/workspaces/{workspace_id}/invitations/{invitation_id}
```
Только owner/admin. Меняет `status = 'canceled'`.

#### 5. Удалить участника
```
DELETE /api/v1/workspaces/{workspace_id}/members/{user_id}
```
Только owner. Нельзя удалить самого owner. Удаляет запись `WorkspaceMember`.

---

### Frontend

#### 1. Исправить определение роли текущего пользователя
В `WorkspacePage` (`frontend/src/pages/workspace/index.tsx`):
```ts
// Сейчас (неверно — всегда возвращает роль owner):
const me = list.find((m) => m.user_id === ws.owner_id)

// Надо:
const { user } = useAuth()
const me = list.find((m) => m.user_id === user?.id)
if (me) setCurrentUserRole(me.role)
```

#### 2. Реальное удаление участника через API
Добавить в `workspacesApi.ts`:
```ts
removeMember: (workspaceId: string, userId: string): Promise<void> =>
  apiClient.delete(`/workspaces/${workspaceId}/members/${userId}`),
```
В `handleTransferConfirm` — вызывать API и только после успеха удалять из state.

#### 3. Список pending-инвайтов на странице Members
Добавить в `workspacesApi.ts`:
```ts
listInvitations: (workspaceId: string): Promise<InvitationResponse[]> =>
  apiClient.get(`/workspaces/${workspaceId}/invitations`),

revokeInvitation: (workspaceId: string, invitationId: string): Promise<void> =>
  apiClient.delete(`/workspaces/${workspaceId}/invitations/${invitationId}`),
```
Под таблицей участников — секция "Pending invitations" с email, ролью, датой истечения и кнопкой отозвать (только для owner/admin).

#### 4. Страница принятия инвайта
```
/invitations/accept?token=...   (публичный маршрут)
```
```tsx
export function AcceptInvitePage() {
  // 1. token из useSearchParams()
  // 2. POST /invitations/accept { token } при маунте
  // 3. Успех → показать "You joined <workspace>! Go to dashboard"
  // 4. Ошибки:
  //    410 → "This invite link has expired"
  //    404 detail "Register first" → "Create an account first" + ссылка на /register
  //    409 → "You are already a member"
  // 5. Loading: "Joining workspace..."
}
```

---

## Порядок реализации

1. Backend: email логирование + accept эндпоинт (самое важное — замыкает цикл)
2. Backend: `GET /invitations`, `DELETE /invitations/:id`, `DELETE /members/:id`
3. Frontend: страница `/invitations/accept`
4. Frontend: фикс роли текущего юзера, реальный remove, список pending-инвайтов

---

## Верификация

1. Войти как owner → Invite → в Docker логах появляется `Invite URL: http://localhost:3000/invitations/accept?token=...`
2. Открыть ссылку → страница "Joining workspace..." → "You joined Ranica!"
3. Обновить Members → новый юзер в списке
4. Попробовать старую ссылку → "This invite link has expired / already used"
5. Owner нажимает Remove → участник исчезает без перезагрузки
6. Owner отзывает pending-инвайт → исчезает из pending-списка
