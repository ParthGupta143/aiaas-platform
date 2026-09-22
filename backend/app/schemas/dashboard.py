import uuid
from datetime import datetime
from pydantic import BaseModel


class ServiceResponse(BaseModel):
    id: uuid.UUID
    slug: str
    name: str
    description: str
    status: str
    price_per_request: float

    class Config:
        from_attributes = True


class UsageStatsResponse(BaseModel):
    total_requests: int
    error_count: int
    error_rate: float
    avg_latency_ms: float
    estimated_cost: float


class RequestLogEntry(BaseModel):
    id: uuid.UUID
    service: str
    status_code: int
    latency_ms: float
    model_version: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class RequestLogsResponse(BaseModel):
    items: list[RequestLogEntry]
    total: int
    page: int
    page_size: int