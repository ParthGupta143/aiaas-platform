from fastapi import Header, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.session import get_db
from app.core.security import hash_api_key
from app.models import ApiKey


async def get_org_from_api_key(
    x_api_key: str = Header(..., alias="X-API-Key"),
    db: AsyncSession = Depends(get_db),
) -> ApiKey:
    key_hash = hash_api_key(x_api_key)
    result = await db.execute(select(ApiKey).where(ApiKey.key_hash == key_hash))
    key = result.scalar_one_or_none()

    if key is None or key.status != "active":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or inactive API key")

    return key