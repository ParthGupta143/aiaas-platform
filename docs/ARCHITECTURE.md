# System Architecture

## Overview

The platform is a monorepo with three deployable pieces:
aiaas-platform/
├── backend/ FastAPI application (the platform's core)
├── frontend/ Next.js dashboard (customer-facing UI)
└── mock-ml-service/ Stand-in for the real fraud model

Postgres and Redis are shared infrastructure, run via Docker Compose.

## Request Lifecycle: Fraud Detection
External developer's backend
│ POST /fraud/predict
│ Header: X-API-Key
▼
FastAPI: get_org_from_api_key

SHA-256 hash the incoming key
look up ApiKey by key_hash
reject if not found / not active
│
▼
check_rate_limit(org_id, service="fraud")
Redis INCR on ratelimit:{org_id}:fraud:{minute_bucket}
429 if over the org's plan limit
│
▼
Pydantic validates FraudCheckRequest
422 on any invalid field (before this point, nothing is logged)
│
▼
ml_client.predict_fraud()
HTTP POST to ML_SERVICE_URL/predict
times out / wraps all failures as MLServiceError → 502
│
▼
RequestLog row written (org_id, service, status_code, latency_ms,
model_version, created_at)
│
▼
FraudCheckResponse returned to caller

## Dashboard Request Lifecycle (JWT-authenticated)

Distinct from the above — a human user in the browser, not a
programmatic integration:
Browser → JWT in Authorization header → get_current_user

decode + verify JWT
re-fetch User row from DB (catches deleted/deactivated users
before token expiry)
│
▼
Route uses current_user.org_id to scope every query
(api-keys, usage, logs, fraud/test)

`/fraud/test` (used by the in-dashboard "Analyze Transaction" screen)
reuses the same ML client and validation as `/fraud/predict`, but
authenticates via JWT instead of API key, and deliberately does
**not** write to `requests` or check rate limits — it's a testing
convenience for the account owner, not counted as real API usage.

## Two Authentication Mechanisms

| | JWT | API Key |
|---|---|---|
| Identifies | A human user | An organization |
| Used by | Dashboard (browser) | External integrations |
| Header | `Authorization: Bearer <token>` | `X-API-Key: <key>` |
| Hash algorithm | bcrypt (passwords) | SHA-256 (keys) |
| Why different hashing | Passwords are low-entropy, checked rarely — slow hashing is a feature | Keys are high-entropy, checked on every request — speed matters, randomness carries the security |

## Database Schema

organizations
├── users (org_id FK)
├── api_keys (org_id FK)
└── requests (org_id FK, api_key_id FK)

services
(catalog — not tenant-scoped; every org sees the same list)

`requests` is the single source of truth for usage. `/usage` and
`/logs` both read from it via SQL aggregation (`COUNT`, `AVG`,
filtered `COUNT` for errors) rather than writing to separate
usage/billing tables on every request — this avoids the two tables
ever drifting out of sync with each other.

**Note:** `requests.service` (a string like `"fraud"`) and
`services.slug` are not foreign-keyed together — they're just kept
in sync by convention. A stricter schema would enforce this with a
real foreign key; noted as a known simplification, not an oversight.

## Tenant Isolation

Every query touching tenant-owned data (`api_keys`, `requests`)
filters by `org_id`, sourced from either `current_user.org_id` (JWT
routes) or `api_key.org_id` (API-key routes) — never from a client-
supplied value in the request body or URL. Revoke/delete operations
filter on `id AND org_id` together in a single query, so a
cross-tenant attempt returns 404 (not found), not 403 (forbidden) —
this avoids leaking whether a resource exists at all to an org that
doesn't own it. Covered by an explicit test:
`test_org_cannot_revoke_another_orgs_key`.

## Rate Limiting

Fixed-window counter in Redis, keyed
`ratelimit:{org_id}:{service}:{minute_bucket}`, scoped per
organization per service (not per individual API key — an org's
multiple keys share one limit bucket). Known limitation: fixed-window
allows a short burst of up to ~2x the limit right at a minute
boundary; a sliding-window or token-bucket algorithm would close
this gap in a production system.

## Extensibility

Adding a new AI service (e.g. Document Extraction) means:
1. A new row in `services` (slug, status: "designed" → "production"
   once a real model exists)
2. A new route module mirroring `fraud/routes.py`'s structure, reusing
   the same `get_org_from_api_key` → `check_rate_limit` → validate →
   ML client → log chain
3. A new client in `clients/` for that service's ML contract

No changes are needed to auth, API keys, rate limiting middleware, or
the dashboard's usage/logs aggregation — they already operate
generically over `service` as a string field.