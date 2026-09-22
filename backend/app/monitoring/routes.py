from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.models import User
from app.schemas.dashboard import ServiceResponse, UsageStatsResponse, RequestLogsResponse
from app.monitoring.service import get_usage_stats, get_request_logs, list_services

router = APIRouter(tags=["dashboard"])


@router.get("/services", response_model=list[ServiceResponse])
async def get_services(db: AsyncSession = Depends(get_db)):
    return await list_services(db)


@router.get("/usage", response_model=UsageStatsResponse)
async def usage_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_usage_stats(db, current_user.org_id)


@router.get("/logs", response_model=RequestLogsResponse)
async def request_logs(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_request_logs(db, current_user.org_id, page, page_size)