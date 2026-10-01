import time
import uuid
from sqlalchemy import select
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.api_keys.dependencies import get_org_from_api_key
from app.middleware.rate_limit import check_rate_limit
from app.schemas.fraud import FraudCheckRequest, FraudCheckResponse
from app.client.ml_client import predict_fraud, FraudPredictionInput, MLServiceError
from app.models import ApiKey, RequestLog
from app.auth.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/fraud", tags=["fraud"])


@router.post("/predict", response_model=FraudCheckResponse)
async def check_fraud(
    payload: FraudCheckRequest,
    api_key: ApiKey = Depends(get_org_from_api_key),
    db: AsyncSession = Depends(get_db),
):
    org_id = api_key.org_id
    request_id = str(uuid.uuid4())

    await check_rate_limit(org_id=str(org_id), service="fraud")

    start = time.perf_counter()
    status_code = 200
    model_version = None

    try:
        result = await predict_fraud(
            FraudPredictionInput(
                amount=payload.amount,
                transaction_hour=payload.transaction_hour,
                merchant_category=payload.merchant_category,
                customer_age=payload.customer_age,
                previous_transactions=payload.previous_transactions,
            ),
            request_id=request_id,
        )
        model_version = result.get("model_version")
    except MLServiceError as e:
        status_code = 502
        latency_ms = (time.perf_counter() - start) * 1000
        db.add(RequestLog(
            org_id=org_id, api_key_id=api_key.id, service="fraud",
            model_version=None, status_code=status_code, latency_ms=latency_ms,
        ))
        await db.commit()
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

    latency_ms = (time.perf_counter() - start) * 1000
    db.add(RequestLog(
        org_id=org_id, api_key_id=api_key.id, service="fraud",
        model_version=model_version, status_code=status_code, latency_ms=latency_ms,
    ))
    await db.commit()

    return FraudCheckResponse(**result)

# ... existing imports and /predict route stay unchanged above ...


@router.post("/test", response_model=FraudCheckResponse)
async def test_fraud(
    payload: FraudCheckRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    request_id = str(uuid.uuid4())

    start = time.perf_counter()
    status_code = 200
    model_version = None

    try:
        result = await predict_fraud(
            FraudPredictionInput(
                amount=payload.amount,
                transaction_hour=payload.transaction_hour,
                merchant_category=payload.merchant_category,
                customer_age=payload.customer_age,
                previous_transactions=payload.previous_transactions,
            ),
            request_id=request_id,
        )

        model_version = result.get("model_version")

    except MLServiceError as e:
        status_code = 502
        latency_ms = (time.perf_counter() - start) * 1000

        # Log failed request
        db.add(
            RequestLog(
                org_id=current_user.org_id,
                api_key_id=None,  # DON'T use this if column is non-nullable
                service="fraud",
                model_version=None,
                status_code=status_code,
                latency_ms=latency_ms,
            )
        )

        await db.commit()

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(e),
        )

    latency_ms = (time.perf_counter() - start) * 1000

    # Log successful request
    db.add(
        RequestLog(
            org_id=current_user.org_id,
            api_key_id=None,
            service="fraud",
            model_version=model_version,
            status_code=status_code,
            latency_ms=latency_ms,
        )
    )

    await db.commit()

    return FraudCheckResponse(**result)