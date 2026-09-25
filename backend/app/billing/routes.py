from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.models import User
from app.schemas.billing import BillingSummaryResponse
from app.billing.service import get_billing_summary

router = APIRouter(prefix="/billing", tags=["billing"])


@router.get("/summary", response_model=BillingSummaryResponse)
async def billing_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_billing_summary(db, current_user.org_id)