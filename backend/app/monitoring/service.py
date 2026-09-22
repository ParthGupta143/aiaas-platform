import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models import RequestLog, Service

PRICE_PER_REQUEST = {"fraud": 0.001}  # fallback if Service lookup misses


async def get_usage_stats(db: AsyncSession, org_id: uuid.UUID) -> dict:
    result = await db.execute(
        select(
            func.count(RequestLog.id),
            func.count(RequestLog.id).filter(RequestLog.status_code >= 400),
            func.coalesce(func.avg(RequestLog.latency_ms), 0.0),
        ).where(RequestLog.org_id == org_id)
    )
    total, errors, avg_latency = result.one()

    price = PRICE_PER_REQUEST.get("fraud", 0.001)
    estimated_cost = round(total * price, 4)
    error_rate = round(errors / total, 4) if total > 0 else 0.0

    return {
        "total_requests": total,
        "error_count": errors,
        "error_rate": error_rate,
        "avg_latency_ms": round(avg_latency, 2),
        "estimated_cost": estimated_cost,
    }


async def get_request_logs(db: AsyncSession, org_id: uuid.UUID, page: int, page_size: int) -> dict:
    count_result = await db.execute(
        select(func.count(RequestLog.id)).where(RequestLog.org_id == org_id)
    )
    total = count_result.scalar_one()

    result = await db.execute(
        select(RequestLog)
        .where(RequestLog.org_id == org_id)
        .order_by(RequestLog.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = list(result.scalars().all())

    return {"items": items, "total": total, "page": page, "page_size": page_size}


async def list_services(db: AsyncSession) -> list[Service]:
    result = await db.execute(select(Service).order_by(Service.status.desc(), Service.name))
    return list(result.scalars().all())