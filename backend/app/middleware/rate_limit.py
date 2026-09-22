import time
from fastapi import HTTPException, status
from app.database.redis import redis_client

PLAN_LIMITS = {
    "free": 100,    # requests per minute
    "pro": 1000,
}


async def check_rate_limit(org_id: str, service: str, plan: str = "free") -> None:
    limit = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
    window = int(time.time() // 60)  # current minute, as an integer bucket
    key = f"ratelimit:{org_id}:{service}:{window}"

    current = await redis_client.incr(key)
    if current == 1:
        await redis_client.expire(key, 60)

    if current > limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded: {limit} requests/minute for {service}",
        )