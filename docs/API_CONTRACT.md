# Fraud Detection API Contract

This is the contract between the AIaaS platform (backend) and the
fraud detection ML service. The platform currently talks to a mock
implementation (`mock-ml-service/`); the real model must implement
this exact contract to be a drop-in replacement.

## Endpoint

POST /predict


## Request

```json
{
  "amount": 14999,
  "transaction_hour": 2,
  "merchant_category": "electronics",
  "customer_age": 25,
  "previous_transactions": 12,
  "request_id": "0dce49b4-cea8-4f7a-9979-f4ade8035691"
}
```

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `amount` | number | > 0 | Transaction amount |
| `transaction_hour` | integer | 0–23 | Hour of day the transaction occurred |
| `merchant_category` | string | 1–100 chars | e.g. "electronics", "groceries" |
| `customer_age` | integer | 0–120 | |
| `previous_transactions` | integer | ≥ 0 | Count of prior transactions for this customer |
| `request_id` | string (UUID) | optional | Trace ID; if omitted, the service should generate one |

## Response

```json
{
  "prediction": "fraud",
  "fraud_probability": 0.91,
  "risk_level": "HIGH",
  "model_version": "fraud-v1",
  "top_risk_factors": ["unusual_amount", "unusual_transaction_time"],
  "request_id": "0dce49b4-cea8-4f7a-9979-f4ade8035691"
}
```

| Field | Type | Notes |
|---|---|---|
| `prediction` | string | `"fraud"` or `"legitimate"` |
| `fraud_probability` | float | 0.0–1.0 |
| `risk_level` | string | `"LOW"`, `"MEDIUM"`, or `"HIGH"` |
| `model_version` | string | Identifies the model that produced this prediction — surfaced in the dashboard and logged per request |
| `top_risk_factors` | array of strings | Free-form; the platform displays these as-is |
| `request_id` | string | Echoed back — required for tracing a request across both systems |

## Timeout & Error Handling

The platform's `ml_client.py` applies a configurable timeout
(`ML_SERVICE_TIMEOUT_SECONDS`, default 5s). Any of the following are
treated identically by the platform — surfaced to the calling
customer as `502 Bad Gateway`:
- Connection refused / service unreachable
- Timeout exceeded
- Any non-2xx HTTP status from the ML service

**Implication for the real service:** it should return a proper HTTP
error status (not a 200 with an error payload) if it cannot produce
a prediction, so the platform's error handling triggers correctly.

## Health Check

The real service should expose:

GET /health → 200 { "status": "ok", "service": "<name>", "version": "<version>" }
Used for basic liveness checks; not currently polled automatically by
the platform, but expected to exist for manual/future monitoring.

## Versioning

`model_version` should change whenever the underlying model is
retrained or replaced. The platform logs this value per-request
(`requests.model_version`) and surfaces it in the dashboard —
this is how a customer can tell which model version produced a
given historical prediction.

## Switching From Mock to Real

Set the backend's `ML_SERVICE_URL` environment variable to the real
service's base URL. No other configuration or code changes required,
provided the real service matches this contract exactly.