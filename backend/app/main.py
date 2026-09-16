from fastapi import FastAPI, Depends
from app.auth.routes import router as auth_router
from app.auth.dependencies import get_current_user
from app.api_keys.routes import router as api_keys_router
from app.models import User

app = FastAPI(title="AIaaS Platform API")

app.include_router(auth_router)
app.include_router(api_keys_router)


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