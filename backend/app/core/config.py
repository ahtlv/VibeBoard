from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_INSECURE_JWT_SECRET = "change-me-in-production"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # App
    APP_ENV: str = "development"
    DEBUG: bool = True

    # JWT
    JWT_SECRET: str = _INSECURE_JWT_SECRET
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/vibeboard"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    # Frontend base URL — used for Stripe redirect URLs
    FRONTEND_URL: str = "http://localhost:5173"

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_ID_PRO: str = ""
    STRIPE_PRICE_ID_TEAM: str = ""

    @model_validator(mode="after")
    def _check_production_secrets(self) -> "Settings":
        if self.APP_ENV == "production":
            if self.JWT_SECRET == _INSECURE_JWT_SECRET:
                raise ValueError("JWT_SECRET must be set to a secure value in production")
            if not self.STRIPE_SECRET_KEY:
                raise ValueError("STRIPE_SECRET_KEY must be set in production")
            if not self.STRIPE_WEBHOOK_SECRET:
                raise ValueError("STRIPE_WEBHOOK_SECRET must be set in production")
        return self


settings = Settings()
