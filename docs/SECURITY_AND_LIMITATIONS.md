# Security Considerations & Known Limitations

This project follows secure-by-default practices appropriate for an
academic / portfolio-level platform. It is **not** claimed to be
enterprise-production-ready. This document is deliberately explicit
about the gap between the two.

## What Is Implemented

- **Password hashing:** bcrypt via passlib, never stored or logged
  in plaintext
- **API key hashing:** SHA-256, raw key shown to the user exactly
  once at creation, never stored or retrievable afterward
- **JWT authentication:** signed, time-limited access tokens for
  dashboard sessions
- **Tenant isolation:** every tenant-scoped database query filters
  by `org_id`; cross-tenant access attempts return 404, not a
  partial success or a 403 that would leak existence — covered by
  automated tests
- **Rate limiting:** Redis-backed, per-organization, per-service
- **Input validation:** Pydantic schemas on every endpoint, rejecting
  malformed requests (422) before they reach business logic
- **Generic auth error messages:** login failures don't distinguish
  "wrong email" from "wrong password," preventing account
  enumeration
- **Secrets in environment variables:** no hardcoded credentials in
  source; `.env` is gitignored

## Known Limitations (Would Be Required for Real Production Use)

| Area | Current State | Production Requirement |
|---|---|---|
| Token revocation | JWTs are stateless; no way to invalidate a token before expiry | Refresh-token rotation + a revocation/blacklist store |
| Rate limiting algorithm | Fixed-window (allows brief ~2x burst at window boundary) | Sliding-window or token-bucket |
| Frontend token storage | In-memory (lost on page refresh) | httpOnly cookies + CSRF protection |
| Route protection (frontend) | Client-side redirect only | Server-side enforcement (Next.js middleware) |
| Secrets management | Plaintext `.env` file | Dedicated secrets manager (e.g. Vault, cloud provider KMS) |
| ML service failure handling | Single attempt, no retry | Retry with backoff; possibly a circuit breaker |
| Database writes on request path | Synchronous | Async queue/buffer for high-throughput scenarios |
| Login brute-force protection | None beyond generic error messages | Rate limiting specifically on `/auth/login` |
| `requests.service` ↔ `services.slug` | Linked by string convention only | Real foreign key constraint |

## AI Service Status Honesty

Per the platform's design principle, service status in the catalog
(`GET /services`) accurately reflects implementation state:

- **Fraud Detection** — `status: "production"`. The platform-side
  gateway (auth, rate limiting, logging, dashboard) is fully
  implemented. The ML model itself is currently a **mock**
  (`mock-ml-service/`) using a simple heuristic, not a trained model
  — see [API_CONTRACT.md](API_CONTRACT.md) for the swap-in process.
- **Document Extraction, Sentiment Analysis, PII Redaction** —
  `status: "designed"`. These exist only as catalog entries. No
  routes, no ML integration, no working functionality. They
  demonstrate the platform's extensibility, not working features.

This distinction is enforced by the `Service.status` field and
surfaced directly in the dashboard's service catalog UI — customers
(and evaluators) see accurate status, not marketing language.

## Reporting

This document should be updated whenever a limitation listed above
is addressed, or a new one is identified.