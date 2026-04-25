from __future__ import annotations

from httpx import AsyncClient

ME_URL = "/api/v1/auth/me"


async def test_me_returns_200_with_user(client: AsyncClient) -> None:
    response = await client.get(ME_URL)

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"
    assert data["plan"] == "free"
    assert data["is_email_verified"] is True
    assert "id" in data
    assert "settings" in data


async def test_me_without_auth_returns_401(unauth_client: AsyncClient) -> None:
    response = await unauth_client.get(ME_URL)

    assert response.status_code == 401
