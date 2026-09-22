from pydantic import BaseModel, Field


class FraudCheckRequest(BaseModel):
    amount: float = Field(gt=0)
    transaction_hour: int = Field(ge=0, le=23)
    merchant_category: str = Field(min_length=1, max_length=100)
    customer_age: int = Field(ge=0, le=120)
    previous_transactions: int = Field(ge=0)


class FraudCheckResponse(BaseModel):
    prediction: str
    fraud_probability: float
    risk_level: str
    model_version: str
    top_risk_factors: list[str]
    request_id: str