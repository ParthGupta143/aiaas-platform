import pytest
from tests.conftest import unique_email


async def test_register_creates_org_and_returns_token(client):
    res = await client.post("/auth/register", json={
        "organization_name": "Test Org",
        "email": unique_email(),
        "password": "testpass123",
    })
    assert res.status_code == 201
    assert "access_token" in res.json()


async def test_register_duplicate_email_fails(client):
    email = unique_email()
    payload = {"organization_name": "Org A", "email": email, "password": "testpass123"}
    await client.post("/auth/register", json=payload)

    res = await client.post("/auth/register", json={**payload, "organization_name": "Org B"})
    assert res.status_code == 409


async def test_login_succeeds_with_correct_credentials(client):
    email = unique_email()
    await client.post("/auth/register", json={
        "organization_name": "Test Org", "email": email, "password": "testpass123",
    })

    res = await client.post("/auth/login", json={"email": email, "password": "testpass123"})
    assert res.status_code == 200
    assert "access_token" in res.json()


async def test_login_fails_with_wrong_password(client):
    email = unique_email()
    await client.post("/auth/register", json={
        "organization_name": "Test Org", "email": email, "password": "testpass123",
    })

    res = await client.post("/auth/login", json={"email": email, "password": "wrongpassword"})
    assert res.status_code == 401


async def test_me_requires_valid_token(client):
    res = await client.get("/auth/me")
    assert res.status_code == 403  # HTTPBearer returns 403 when header is missing entirely


async def test_me_returns_current_user(client):
    email = unique_email()
    register_res = await client.post("/auth/register", json={
        "organization_name": "Test Org", "email": email, "password": "testpass123",
    })
    token = register_res.json()["access_token"]

    res = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["email"] == email