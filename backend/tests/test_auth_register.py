from __future__ import annotations

from httpx import AsyncClient


REGISTER_URL = "/api/v1/auth/register"

VALID_PAYLOAD = {
    "email": "alice@example.com",
    "password": "securepass123",
    "name": "Alice",
}


async def test_register_returns_201_with_verification_required(client: AsyncClient) -> None:
    response = await client.post(REGISTER_URL, json=VALID_PAYLOAD)

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == VALID_PAYLOAD["email"]
    assert data["email_verification_required"] is True
    assert data["message"]


async def test_register_does_not_return_access_token(client: AsyncClient) -> None:
    response = await client.post(REGISTER_URL, json=VALID_PAYLOAD)

    data = response.json()
    assert "access_token" not in data
    assert "user" not in data


async def test_register_duplicate_email_returns_409(client: AsyncClient) -> None:
    await client.post(REGISTER_URL, json=VALID_PAYLOAD)
    response = await client.post(REGISTER_URL, json=VALID_PAYLOAD)

    assert response.status_code == 409


async def test_register_short_password_returns_422(client: AsyncClient) -> None:
    payload = {**VALID_PAYLOAD, "password": "short"}
    response = await client.post(REGISTER_URL, json=payload)

    assert response.status_code == 422


async def test_register_invalid_email_returns_422(client: AsyncClient) -> None:
    payload = {**VALID_PAYLOAD, "email": "not-an-email"}
    response = await client.post(REGISTER_URL, json=payload)

    assert response.status_code == 422
