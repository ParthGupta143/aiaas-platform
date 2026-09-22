import uuid
import httpx
from app.core.config import settings


class MLServiceError(Exception):
    """Raised when the ML service is unreachable or returns an error."""
    pass


class FraudPredictionInput:
    def __init__(self, amount: float, transaction_hour: int, merchant_category: str,
                 customer_age: int, previous_transactions: int):
        self.amount = amount
        self.transaction_hour = transaction_hour
        self.merchant_category = merchant_category
        self.customer_age = customer_age
        self.previous_transactions = previous_transactions


async def predict_fraud(payload: FraudPredictionInput, request_id: str) -> dict:
    body = {
        "amount": payload.amount,
        "transaction_hour": payload.transaction_hour,
        "merchant_category": payload.merchant_category,
        "customer_age": payload.customer_age,
        "previous_transactions": payload.previous_transactions,
        "request_id": request_id,
    }

    try:
        async with httpx.AsyncClient(timeout=settings.ML_SERVICE_TIMEOUT_SECONDS) as client:
            response = await client.post(f"{settings.ML_SERVICE_URL}/predict", json=body)
            response.raise_for_status()
            return response.json()
    except httpx.TimeoutException:
        raise MLServiceError("ML service timed out")
    except httpx.HTTPStatusError as e:
        raise MLServiceError(f"ML service returned an error: {e.response.status_code}")
    except httpx.RequestError:
        raise MLServiceError("ML service is unreachable")