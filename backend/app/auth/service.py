from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Organization, User
from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.auth import RegisterRequest, LoginRequest
from app.models import User as UserModel


class AuthError(Exception):
    pass


async def register_user(db: AsyncSession, payload: RegisterRequest) -> tuple[User, str]:
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise AuthError("An account with this email already exists")

    org = Organization(name=payload.organization_name)
    db.add(org)
    await db.flush()  # assigns org.id without committing yet

    user = User(
        org_id=org.id,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role="owner",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(subject=str(user.id), org_id=str(org.id))
    return user, token


async def login_user(db: AsyncSession, payload: LoginRequest) -> tuple[User, str]:
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(payload.password, user.hashed_password):
        raise AuthError("Invalid email or password")

    token = create_access_token(subject=str(user.id), org_id=str(user.org_id))
    return user, token

async def change_password(db: AsyncSession, user: User, current_password: str, new_password: str) -> None:
    if not verify_password(current_password, user.hashed_password):
        raise AuthError("Current password is incorrect")

    user.hashed_password = hash_password(new_password)
    await db.commit()