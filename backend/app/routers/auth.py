"""Authentication router — signup, login, profile CRUD."""

from __future__ import annotations

import re
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.core.database import get_database
from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user_schemas import (
    ChangePasswordRequest,
    LoginRequest,
    SignupRequest,
    UpdateProfileRequest,
)

router = APIRouter()

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


# ── Helpers ───────────────────────────────────────────────────────────────────

def _user_to_dict(user: dict, total_portfolios: int = 0) -> dict:
    """Serialize a MongoDB user document to a safe JSON-able dict."""
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "phone": user["phone"],
        "created_at": user["created_at"].isoformat() if user.get("created_at") else None,
        "updated_at": user.get("updated_at", user.get("created_at")).isoformat()
        if user.get("updated_at") or user.get("created_at") else None,
        "last_login": user["last_login"].isoformat() if user.get("last_login") else None,
        "total_portfolios": total_portfolios,
    }


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/auth/signup")
async def signup(body: SignupRequest):
    """Register a new user. Returns JWT + user object."""
    db = get_database()

    if await db.users.find_one({"email": body.email}):
        raise HTTPException(status_code=400, detail="An account with this email already exists")
    if await db.users.find_one({"phone": body.phone}):
        raise HTTPException(status_code=400, detail="An account with this phone number already exists")

    now = datetime.now(timezone.utc)
    doc = {
        "name": body.name.strip(),
        "email": body.email,
        "phone": body.phone,
        "password_hash": hash_password(body.password),
        "created_at": now,
        "updated_at": now,
        "last_login": now,
    }
    result = await db.users.insert_one(doc)
    user = await db.users.find_one({"_id": result.inserted_id})
    token = create_access_token({"sub": str(result.inserted_id)})
    return {"token": token, "user": _user_to_dict(user)}


@router.post("/auth/login")
async def login(body: LoginRequest):
    """Login with email-or-phone + password. Returns JWT + user object."""
    db = get_database()

    # Auto-detect identifier type
    if _EMAIL_RE.match(body.identifier.strip()):
        user = await db.users.find_one({"email": body.identifier.lower().strip()})
    else:
        user = await db.users.find_one({"phone": body.identifier.strip()})

    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    now = datetime.now(timezone.utc)
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"last_login": now}})
    user["last_login"] = now

    token = create_access_token({"sub": str(user["_id"])})
    return {"token": token, "user": _user_to_dict(user)}


@router.get("/auth/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Return the authenticated user's profile + portfolio count."""
    db = get_database()
    count = await db.portfolio_history.count_documents({"user_id": str(current_user["_id"])})
    return _user_to_dict(current_user, total_portfolios=count)


@router.put("/auth/profile")
async def update_profile(
    body: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update name and/or phone. Email cannot be changed."""
    db = get_database()
    updates: dict = {"updated_at": datetime.now(timezone.utc)}

    if body.name:
        updates["name"] = body.name.strip()
    if body.phone:
        conflict = await db.users.find_one(
            {"phone": body.phone, "_id": {"$ne": current_user["_id"]}}
        )
        if conflict:
            raise HTTPException(status_code=400, detail="Phone number already in use by another account")
        updates["phone"] = body.phone

    await db.users.update_one({"_id": current_user["_id"]}, {"$set": updates})
    user = await db.users.find_one({"_id": current_user["_id"]})
    count = await db.portfolio_history.count_documents({"user_id": str(current_user["_id"])})
    return _user_to_dict(user, total_portfolios=count)


@router.put("/auth/change-password")
async def change_password(
    body: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
):
    """Change password after verifying the current one."""
    if not verify_password(body.current_password, current_user["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    db = get_database()
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {
            "password_hash": hash_password(body.new_password),
            "updated_at": datetime.now(timezone.utc),
        }},
    )
    return {"message": "Password updated successfully"}
