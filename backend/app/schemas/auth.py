from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


# ── requests ──────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: Optional[str] = Field(default=None, max_length=255)

    @field_validator("password")
    @classmethod
    def password_not_blank(cls, v: str) -> str:
        if v.strip() == "":
            raise ValueError("Password must not be blank")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=1)


# ── responses ─────────────────────────────────────────────────────────────────

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
    plan: str
    settings: UserSettingsResponse
    created_at: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_user(cls, user: object) -> "UserResponse":
        """Собирает UserResponse из ORM-модели User, разворачивая settings_* поля."""
        from app.models.user import User as UserModel
        u: UserModel = user  # type: ignore[assignment]
        return cls(
            id=str(u.id),
            email=u.email,
            name=u.name,
            avatar_url=u.avatar_url,
            plan=u.plan,
            settings=UserSettingsResponse(
                theme=u.settings_theme,
                language=u.settings_language,
                email_notifications=u.settings_email_notifications,
                desktop_notifications=u.settings_desktop_notifications,
            ),
            created_at=u.created_at,
        )


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # секунды


class LoginResponse(TokenResponse):
    user: UserResponse


class RegisterResponse(TokenResponse):
    user: UserResponse
