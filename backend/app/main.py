from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.auth.routes import router as auth_router
from app.auth.dependencies import get_current_user
from app.api_keys.routes import router as api_keys_router
from app.fraud.routes import router as fraud_router
from app.monitoring.routes import router as monitoring_router
from app.models import User
from app.billing.routes import router as billing_router

app = FastAPI(title="AIaaS Platform API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://mindora-ai-beta.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(api_keys_router)
app.include_router(fraud_router)
app.include_router(monitoring_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "backend"}


@app.get("/auth/me")
async def read_current_user(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "org_id": str(current_user.org_id),
        "role": current_user.role,
    }

# ... existing app.include_router(...) calls ...
app.include_router(billing_router)