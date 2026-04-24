from __future__ import annotations

from datetime import datetime, timezone

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user import UserRepository

REGISTER_URL = "/api/v1/auth/register"
LOGIN_URL = "/api/v1/auth/login"

_USER = {
    "email": "bob@example.com",
    "password": "securepass123",
    "name": "Bob",
}


async def _register(client: AsyncClient) -> None:
    resp = await client.post(REGISTER_URL, json=_USER)
    assert resp.status_code == 201


async def _mark_verified(db_session: AsyncSession) -> None:
    user = await UserRepository(db_session).get_by_email(_USER["email"])
    assert user is not None
    user.email_verified_at = datetime.now(timezone.utc)
    user.email_verification_token_hash = None
    user.email_verification_sent_at = None
    await db_session.commit()


async def test_login_returns_200_with_token(client: AsyncClient, db_session: AsyncSession) -> None:
    await _register(client)
    await _mark_verified(db_session)

    response = await client.post(LOGIN_URL, json={
        "email": _USER["email"],
        "password": _USER["password"],
    })

    assert response.status_code == 200
    data = response.json()
    assert data["access_token"]
    assert data["token_type"] == "bearer"
    assert data["expires_in"] > 0


async def test_login_response_contains_correct_user(client: AsyncClient, db_session: AsyncSession) -> None:
    await _register(client)
    await _mark_verified(db_session)

    response = await client.post(LOGIN_URL, json={
        "email": _USER["email"],
        "password": _USER["password"],
    })

    user = response.json()["user"]
    assert user["email"] == _USER["email"]
    assert user["name"] == _USER["name"]
    assert user["plan"] == "free"
    assert user["id"]
    assert user["is_email_verified"] is True


async def test_login_unverified_email_returns_403(client: AsyncClient) -> None:
    await _register(client)

    response = await client.post(LOGIN_URL, json={
        "email": _USER["email"],
        "password": _USER["password"],
    })

    assert response.status_code == 403


async def test_login_wrong_password_returns_401(client: AsyncClient, db_session: AsyncSession) -> None:
    await _register(client)
    await _mark_verified(db_session)

    response = await client.post(LOGIN_URL, json={
        "email": _USER["email"],
        "password": "wrongpassword",
    })

    assert response.status_code == 401


async def test_login_unknown_email_returns_401(client: AsyncClient) -> None:
    response = await client.post(LOGIN_URL, json={
        "email": "nobody@example.com",
        "password": "somepassword",
    })

    assert response.status_code == 401


async def test_login_missing_password_returns_422(client: AsyncClient) -> None:
    response = await client.post(LOGIN_URL, json={"email": _USER["email"]})

    assert response.status_code == 422
