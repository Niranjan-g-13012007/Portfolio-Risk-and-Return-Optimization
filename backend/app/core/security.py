"""Password hashing (bcrypt) and JWT token creation / verification."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from jose import jwt, JWTError  # type: ignore
from passlib.context import CryptContext  # type: ignore

from app.core.config import JWT_ALGORITHM, JWT_EXPIRE_MINUTES, JWT_SECRET

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Passwords ────────────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ── JWT ───────────────────────────────────────────────────────────────────────

def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """Raises jose.JWTError on invalid / expired tokens."""
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
