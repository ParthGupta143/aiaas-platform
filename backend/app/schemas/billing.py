from pydantic import BaseModel


class BillingServiceLine(BaseModel):
    service_slug: str
    service_name: str
    requests_used: int
    price_per_request: float
    estimated_cost: float


class BillingSummaryResponse(BaseModel):
    period: str  # honestly labeled — see note below
    lines: list[BillingServiceLine]
    total_estimated_cost: float