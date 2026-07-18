"""Application settings loaded from environment / .env file."""

from __future__ import annotations

import os
from dotenv import load_dotenv

# Load .env from the backend root (backend/.env)
load_dotenv()

MONGODB_URI: str = os.getenv("MONGODB_URI", "")
JWT_SECRET: str = os.getenv("JWT_SECRET", "CHANGE_THIS_IN_PRODUCTION_PLEASE")
JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))  # 7 days
