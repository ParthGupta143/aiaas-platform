from tests.conftest import unique_email


async def setup_org_with_key(client):
    email = unique_email()
    register_res = await client.post("/auth/register", json={
        "organization_name": "Test Org", "email": email, "password": "testpass123",
    })
    jwt_token = register_res.json()["access_token"]

    key_res = await client.post(
        "/api-keys", json={"name": "Test Key"}, headers={"Authorization": f"Bearer {jwt_token}"}
    )
    return key_res.json()["api_key"], jwt_token


VALID_TRANSACTION = {
    "amount": 100.0, "transaction_hour": 12, "merchant_category": "electronics",
    "customer_age": 30, "previous_transactions": 5,
}


async def test_predict_succeeds_with_valid_api_key(client):
    api_key, _ = await setup_org_with_key(client)
    res = await client.post("/fraud/predict", json=VALID_TRANSACTION, headers={"X-API-Key": api_key})
    assert res.status_code == 200
    body = res.json()
    assert "prediction" in body
    assert "request_id" in body


async def test_predict_fails_with_invalid_api_key(client):
    res = await client.post("/fraud/predict", json=VALID_TRANSACTION, headers={"X-API-Key": "sk_live_garbage"})
    assert res.status_code == 401


async def test_predict_rejects_invalid_transaction_hour(client):
    api_key, _ = await setup_org_with_key(client)
    bad_transaction = {**VALID_TRANSACTION, "transaction_hour": 30}
    res = await client.post("/fraud/predict", json=bad_transaction, headers={"X-API-Key": api_key})
    assert res.status_code == 422


async def test_predict_requires_api_key_header(client):
    res = await client.post("/fraud/predict", json=VALID_TRANSACTION)
    assert res.status_code == 422  # missing required header, FastAPI validation error


async def test_test_route_uses_jwt_not_api_key(client):
    """The /fraud/test route should work with JWT and reject a missing one — no API key involved."""
    _, jwt_token = await setup_org_with_key(client)
    res = await client.post(
        "/fraud/test", json=VALID_TRANSACTION, headers={"Authorization": f"Bearer {jwt_token}"}
    )
    assert res.status_code == 200


async def test_test_route_rejects_api_key_auth(client):
    api_key, _ = await setup_org_with_key(client)
    res = await client.post("/fraud/test", json=VALID_TRANSACTION, headers={"X-API-Key": api_key})
    assert res.status_code == 403  # no Authorization header present at all