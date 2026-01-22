from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: Optional[int] = None


class TokenData(BaseModel):
    user_id: Optional[str] = None
    username: Optional[str] = None


class OAuthCallback(BaseModel):
    code: str
    state: Optional[str] = None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: str


class OAuthStartResponse(BaseModel):
    auth_url: str
    state: str
