"""Pydantic models for user authentication and profile management."""

from __future__ import annotations

import re
from typing import Optional

from pydantic import BaseModel, Field, field_validator

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_PHONE_RE = re.compile(r"^\+?[0-9]{7,15}$")
_PWD_RE = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{};:'\",.<>/?\\|`~]).{8,}$"
)


class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str
    phone: str
    password: str

    @field_validator("email")
    @classmethod
    def _validate_email(cls, v: str) -> str:
        v = v.lower().strip()
        if not _EMAIL_RE.match(v):
            raise ValueError("Invalid email address")
        return v

    @field_validator("phone")
    @classmethod
    def _validate_phone(cls, v: str) -> str:
        v = v.strip()
        if not _PHONE_RE.match(v):
            raise ValueError("Phone must be 7-15 digits, optionally prefixed with +")
        return v

    @field_validator("password")
    @classmethod
    def _validate_password(cls, v: str) -> str:
        if not _PWD_RE.match(v):
            raise ValueError(
                "Password must be ≥8 chars and include uppercase, lowercase, digit, and special character"
            )
        return v


class LoginRequest(BaseModel):
    identifier: str  # email OR phone — auto-detected
    password: str


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def _validate_phone(cls, v: str | None) -> str | None:
        if v and not _PHONE_RE.match(v.strip()):
            raise ValueError("Invalid phone number")
        return v.strip() if v else v


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def _validate_new_password(cls, v: str) -> str:
        if not _PWD_RE.match(v):
            raise ValueError(
                "New password must be ≥8 chars with uppercase, lowercase, digit, and special character"
            )
        return v
