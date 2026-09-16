import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import ApiKey
from app.core.security import generate_api_key, hash_api_key, key_display_prefix
from app.schemas.api_key import ApiKeyCreateRequest


class ApiKeyError(Exception):
    pass


async def create_api_key(db: AsyncSession, org_id: uuid.UUID, payload: ApiKeyCreateRequest) -> tuple[ApiKey, str]:
    raw_key = generate_api_key()
    key = ApiKey(
        org_id=org_id,
        name=payload.name,
        key_hash=hash_api_key(raw_key),
        key_prefix=key_display_prefix(raw_key),
        status="active",
    )
    db.add(key)
    await db.commit()
    await db.refresh(key)
    return key, raw_key


async def list_api_keys(db: AsyncSession, org_id: uuid.UUID) -> list[ApiKey]:
    result = await db.execute(select(ApiKey).where(ApiKey.org_id == org_id))
    return list(result.scalars().all())


async def revoke_api_key(db: AsyncSession, org_id: uuid.UUID, key_id: uuid.UUID) -> ApiKey:
    result = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.org_id == org_id)
    )
    key = result.scalar_one_or_none()
    if key is None:
        raise ApiKeyError("API key not found")
    if key.status == "revoked":
        raise ApiKeyError("API key is already revoked")

    key.status = "revoked"
    key.revoked_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(key)
    return key