from tests.conftest import unique_email


async def get_token(client, email=None):
    email = email or unique_email()
    res = await client.post("/auth/register", json={
        "organization_name": "Test Org", "email": email, "password": "testpass123",
    })
    return res.json()["access_token"]


async def test_create_api_key_returns_raw_key_once(client):
    token = await get_token(client)
    res = await client.post("/api-keys", json={"name": "My Key"}, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 201
    body = res.json()
    assert body["api_key"].startswith("sk_live_")
    assert "key_hash" not in body  # never exposed


async def test_list_api_keys_never_exposes_raw_key(client):
    token = await get_token(client)
    await client.post("/api-keys", json={"name": "My Key"}, headers={"Authorization": f"Bearer {token}"})

    res = await client.get("/api-keys", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert "api_key" not in res.json()[0]


async def test_revoke_key_twice_fails_second_time(client):
    token = await get_token(client)
    created = await client.post("/api-keys", json={"name": "My Key"}, headers={"Authorization": f"Bearer {token}"})
    key_id = created.json()["id"]
    headers = {"Authorization": f"Bearer {token}"}

    first = await client.delete(f"/api-keys/{key_id}", headers=headers)
    assert first.status_code == 200

    second = await client.delete(f"/api-keys/{key_id}", headers=headers)
    assert second.status_code == 404


async def test_org_cannot_revoke_another_orgs_key(client):
    """The actual tenant-isolation test — this is the one that matters most."""
    token_a = await get_token(client)
    token_b = await get_token(client)

    created = await client.post(
        "/api-keys", json={"name": "Org A Key"}, headers={"Authorization": f"Bearer {token_a}"}
    )
    key_id = created.json()["id"]

    # Org B tries to revoke Org A's key
    res = await client.delete(f"/api-keys/{key_id}", headers={"Authorization": f"Bearer {token_b}"})
    assert res.status_code == 404  # not 403 — org B shouldn't even know it exists