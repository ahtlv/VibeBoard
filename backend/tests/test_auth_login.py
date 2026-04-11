from __future__ import annotations

from httpx import AsyncClient

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


async def test_login_returns_200_with_token(client: AsyncClient) -> None:
    await _register(client)

    response = await client.post(LOGIN_URL, json={
        "email": _USER["email"],
        "password": _USER["password"],
    })

    assert response.status_code == 200
    data = response.json()
    assert data["access_token"]
    assert data["token_type"] == "bearer"
    assert data["expires_in"] > 0


async def test_login_response_contains_correct_user(client: AsyncClient) -> None:
    await _register(client)

    response = await client.post(LOGIN_URL, json={
        "email": _USER["email"],
        "password": _USER["password"],
    })

    user = response.json()["user"]
    assert user["email"] == _USER["email"]
    assert user["name"] == _USER["name"]
    assert user["plan"] == "free"
    assert user["id"]


async def test_login_wrong_password_returns_401(client: AsyncClient) -> None:
    await _register(client)

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
