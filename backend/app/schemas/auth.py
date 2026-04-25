from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class UserSettingsResponse(BaseModel):
    theme: str
    language: str
    email_notifications: bool
    desktop_notifications: bool

    model_config = {"from_attributes": True}


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    avatar_url: Optional[str]
    is_email_verified: bool
    plan: str
    settings: UserSettingsResponse
    created_at: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_user(cls, user: object) -> "UserResponse":
        from app.models.user import User as UserModel
        u: UserModel = user  # type: ignore[assignment]
        return cls(
            id=str(u.id),
            email=u.email,
            name=u.name,
            avatar_url=u.avatar_url,
            is_email_verified=True,  # Supabase enforces email verification before session is issued
            plan=u.plan,
            settings=UserSettingsResponse(
                theme=u.settings_theme,
                language=u.settings_language,
                email_notifications=u.settings_email_notifications,
                desktop_notifications=u.settings_desktop_notifications,
            ),
            created_at=u.created_at,
        )
