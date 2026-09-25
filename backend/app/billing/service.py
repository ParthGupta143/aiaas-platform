import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models import RequestLog, Service


async def get_billing_summary(db: AsyncSession, org_id: uuid.UUID) -> dict:
    result = await db.execute(
        select(RequestLog.service, func.count(RequestLog.id))
        .where(RequestLog.org_id == org_id)
        .group_by(RequestLog.service)
    )
    usage_by_service: dict[str, int] = dict(result.all())

    services_result = await db.execute(select(Service))
    all_services = services_result.scalars().all()

    lines = []
    total = 0.0
    for service in all_services:
        count = usage_by_service.get(service.slug, 0)
        cost = round(count * service.price_per_request, 4)
        total += cost
        lines.append({
            "service_slug": service.slug,
            "service_name": service.name,
            "requests_used": count,
            "price_per_request": service.price_per_request,
            "estimated_cost": cost,
        })

    return {
        "period": "All-time",
        "lines": lines,
        "total_estimated_cost": round(total, 4),
    }