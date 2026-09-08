import random
import uuid
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Mock Fraud ML Service", version="mock-v1")


class PredictRequest(BaseModel):
    amount: float
    transaction_hour: int = Field(ge=0, le=23)
    merchant_category: str
    customer_age: int
    previous_transactions: int
    request_id: str | None = None  # optional trace id, passed through if given


class PredictResponse(BaseModel):
    prediction: str
    fraud_probability: float
    risk_level: str
    model_version: str
    top_risk_factors: list[str]
    request_id: str


RISK_FACTORS_POOL = [
    "unusual_amount",
    "unusual_transaction_time",
    "high_risk_merchant_category",
    "new_customer_profile",
    "velocity_anomaly",
]


@app.get("/health")
def health():
    return {"status": "ok", "service": "mock-ml", "version": "mock-v1"}


@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    # Deliberately simple, semi-realistic heuristic — NOT a real model.
    # Just enough signal that it doesn't feel purely random during platform testing.
    risk_score = 0.1
    if payload.amount > 10000:
        risk_score += 0.35
    if payload.transaction_hour < 5 or payload.transaction_hour > 23:
        risk_score += 0.2
    if payload.previous_transactions < 3:
        risk_score += 0.15
    risk_score += random.uniform(-0.1, 0.1)
    risk_score = max(0.01, min(0.99, risk_score))

    prediction = "fraud" if risk_score >= 0.5 else "legitimate"
    risk_level = "HIGH" if risk_score >= 0.7 else "MEDIUM" if risk_score >= 0.4 else "LOW"

    factor_count = 1 if risk_score < 0.5 else random.randint(2, 3)
    top_risk_factors = random.sample(RISK_FACTORS_POOL, k=factor_count)

    return PredictResponse(
        prediction=prediction,
        fraud_probability=round(risk_score, 2),
        risk_level=risk_level,
        model_version="mock-v1",
        top_risk_factors=top_risk_factors,
        request_id=payload.request_id or str(uuid.uuid4()),
    )