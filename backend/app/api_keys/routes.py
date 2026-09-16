import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.models import User
from app.schemas.api_key import ApiKeyCreateRequest, ApiKeyCreateResponse, ApiKeyResponse
from app.api_keys.service import create_api_key, list_api_keys, revoke_api_key, ApiKeyError

router = APIRouter(prefix="/api-keys", tags=["api-keys"])


@router.post("", response_model=ApiKeyCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_key(
    payload: ApiKeyCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    key, raw_key = await create_api_key(db, current_user.org_id, payload)
    return ApiKeyCreateResponse(
        id=key.id, name=key.name, api_key=raw_key,
        key_prefix=key.key_prefix, created_at=key.created_at,
    )


@router.get("", response_model=list[ApiKeyResponse])
async def list_keys(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await list_api_keys(db, current_user.org_id)


@router.delete("/{key_id}", response_model=ApiKeyResponse)
async def revoke_key(
    key_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await revoke_api_key(db, current_user.org_id, key_id)
    except ApiKeyError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))