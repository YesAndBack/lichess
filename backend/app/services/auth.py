import secrets
import hashlib
import base64
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt

from app.config import settings
from app.schemas.auth import TokenData


class AuthService:
    """Service for authentication operations"""
    
    # In-memory storage for PKCE verifiers (in production, use Redis)
    _pkce_store: dict[str, str] = {}
    
    @staticmethod
    def generate_pkce_pair() -> tuple[str, str]:
        """Generate PKCE code verifier and challenge"""
        # Generate random code verifier (43-128 characters)
        code_verifier = secrets.token_urlsafe(64)
        
        # Generate code challenge using S256 method
        digest = hashlib.sha256(code_verifier.encode()).digest()
        code_challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode()
        
        return code_verifier, code_challenge
    
    @staticmethod
    def generate_state() -> str:
        """Generate random state for OAuth"""
        return secrets.token_urlsafe(32)
    
    @classmethod
    def store_pkce_verifier(cls, state: str, verifier: str) -> None:
        """Store PKCE verifier associated with state"""
        cls._pkce_store[state] = verifier
    
    @classmethod
    def get_pkce_verifier(cls, state: str) -> Optional[str]:
        """Get and remove PKCE verifier for state"""
        return cls._pkce_store.pop(state, None)
    
    @staticmethod
    def get_lichess_auth_url(state: str, code_challenge: str) -> str:
        """Generate Lichess OAuth authorization URL"""
        scopes = "preference:read"  # Minimal scope needed
        
        params = {
            "response_type": "code",
            "client_id": settings.LICHESS_CLIENT_ID,
            "redirect_uri": settings.LICHESS_REDIRECT_URI,
            "scope": scopes,
            "state": state,
            "code_challenge_method": "S256",
            "code_challenge": code_challenge,
        }
        
        query_string = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{settings.LICHESS_AUTH_URL}?{query_string}"
    
    @staticmethod
    def create_access_token(
        data: dict,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode,
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM
        )
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[TokenData]:
        """Verify JWT token and return token data"""
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
            user_id: str = payload.get("sub")
            username: str = payload.get("username")
            
            if user_id is None:
                return None
            
            return TokenData(user_id=user_id, username=username)
        except JWTError:
            return None
