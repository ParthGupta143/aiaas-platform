from tests.conftest import unique_email


async def test_usage_stats_start_at_zero_for_new_org(client):
    email = unique_email()
    register_res = await client.post("/auth/register", json={
        "organization_name": "Test Org", "email": email, "password": "testpass123",
    })
    token = register_res.json()["access_token"]

    res = await client.get("/usage", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    body = res.json()
    assert body["total_requests"] == 0
    assert body["avg_latency_ms"] == 0.0  # proves the coalesce() fix from Phase 5 works


async def test_logs_paginate_correctly(client):
    email = unique_email()
    register_res = await client.post("/auth/register", json={
        "organization_name": "Test Org", "email": email, "password": "testpass123",
    })
    token = register_res.json()["access_token"]

    res = await client.get("/logs?page=1&page_size=5", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    body = res.json()
    assert body["page"] == 1
    assert body["page_size"] == 5
    assert body["total"] == 0