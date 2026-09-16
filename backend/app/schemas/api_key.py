import uuid
from datetime import datetime
from pydantic import BaseModel, Field


class ApiKeyCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class ApiKeyCreateResponse(BaseModel):
    id: uuid.UUID
    name: str
    api_key: str  # the ONLY time the raw key is ever returned
    key_prefix: str
    created_at: datetime


class ApiKeyResponse(BaseModel):
    id: uuid.UUID
    name: str
    key_prefix: str
    status: str
    created_at: datetime
    revoked_at: datetime | None

    class Config:
        from_attributes = True