import hashlib
import hmac
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.core.config import get_settings

bearer = HTTPBearer(auto_error=False)


def current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)) -> str:
    settings = get_settings()
    if not settings.api_key_hashes:
        raise HTTPException(503, "API authentication is not configured")
    if credentials:
        digest = hashlib.sha256(credentials.credentials.encode()).hexdigest()
        for expected, user_id in settings.api_key_hashes.items():
            if hmac.compare_digest(digest, expected) and user_id:
                return user_id
    raise HTTPException(401, "Invalid API token", headers={"WWW-Authenticate": "Bearer"})
