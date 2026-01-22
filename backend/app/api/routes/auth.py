from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.auth import OAuthCallback, LoginResponse, OAuthStartResponse
from app.services.auth import AuthService
from app.services.lichess import LichessService
from app.services.user import UserService
from app.api.deps import get_current_user
from app.models.user import User


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/login", response_model=OAuthStartResponse)
async def start_oauth():
    """
    Start OAuth2 flow with Lichess.
    Returns the authorization URL to redirect the user to.
    """
    # Generate PKCE pair
    code_verifier, code_challenge = AuthService.generate_pkce_pair()
    
    # Generate state
    state = AuthService.generate_state()
    
    # Store verifier for later use
    AuthService.store_pkce_verifier(state, code_verifier)
    
    # Generate auth URL
    auth_url = AuthService.get_lichess_auth_url(state, code_challenge)
    
    return OAuthStartResponse(auth_url=auth_url, state=state)


@router.post("/callback", response_model=LoginResponse)
async def oauth_callback(
    callback: OAuthCallback,
    db: AsyncSession = Depends(get_db),
):
    """
    Handle OAuth2 callback from Lichess.
    Exchange authorization code for access token.
    """
    # Get PKCE verifier
    code_verifier = AuthService.get_pkce_verifier(callback.state)
    if not code_verifier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired state. Please try logging in again.",
        )
    
    # Exchange code for token
    token_response = await LichessService.exchange_code_for_token(
        callback.code,
        code_verifier,
    )
    
    if not token_response:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to exchange code for token. Please try again.",
        )
    
    access_token = token_response.get("access_token")
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No access token in response",
        )
    
    # Get user account info from Lichess
    lichess_service = LichessService(access_token)
    account_data = await lichess_service.get_account()
    
    if not account_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to get account info from Lichess",
        )
    
    # Create or update user in database
    user = await UserService.create_or_update_user(
        db,
        lichess_data=account_data,
        access_token=access_token,
        refresh_token=token_response.get("refresh_token"),
    )
    
    # Create JWT token for our app
    jwt_token = AuthService.create_access_token(
        data={"sub": user.id, "username": user.username}
    )
    
    return LoginResponse(
        access_token=jwt_token,
        token_type="bearer",
        user_id=user.id,
        username=user.username,
    )


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Logout user - revoke Lichess token and clear stored tokens.
    """
    # Revoke Lichess token if exists
    if current_user.access_token:
        await LichessService.revoke_token(current_user.access_token)
    
    # Clear stored tokens
    await UserService.clear_user_tokens(db, current_user)
    
    return {"message": "Successfully logged out"}


@router.get("/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    """
    Get current authenticated user's basic info.
    """
    return {
        "id": current_user.id,
        "username": current_user.username,
        "title": current_user.title,
        "patron": current_user.patron,
    }
