from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings

_ALGORITHM = "HS256"


# ── password hashing ──────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    """Возвращает bcrypt-хеш пароля."""
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    """Проверяет пароль против bcrypt-хеша. Возвращает False при любой ошибке."""
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception:
        return False


# ── JWT ───────────────────────────────────────────────────────────────────────

def create_access_token(user_id: str) -> str:
    """Создаёт подписанный HS256 JWT с sub=user_id и exp."""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "iat": now,
        "exp": expire,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=_ALGORITHM)


def decode_access_token(token: str) -> str:
    """Декодирует JWT и возвращает user_id (sub).

    Raises:
        jose.JWTError: невалидная подпись, истёкший токен или некорректный формат.
    """
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[_ALGORITHM])
    sub: str | None = payload.get("sub")
    if not sub:
        raise JWTError("Missing 'sub' in token payload")
    return sub
