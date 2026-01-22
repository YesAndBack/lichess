from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.user import UserResponse, UserRatings, UserProfile
from app.services.user import UserService
from app.services.lichess import LichessService
from app.api.deps import get_current_user
from app.models.user import User


router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    """
    Get current user's full profile including ratings.
    """
    # Parse ratings and profile
    ratings = UserService.parse_ratings(current_user.ratings or {})
    profile = UserService.parse_profile(current_user.profile or {})
    
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        title=current_user.title,
        patron=current_user.patron,
        created_at_lichess=current_user.created_at_lichess,
        seen_at=current_user.seen_at,
        play_time_total=current_user.play_time_total or 0,
        play_time_tv=current_user.play_time_tv or 0,
        ratings=ratings,
        profile=profile,
    )


@router.post("/me/refresh")
async def refresh_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Refresh current user's profile from Lichess API.
    """
    if not current_user.access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No Lichess token available. Please log in again.",
        )
    
    # Fetch fresh data from Lichess
    lichess_service = LichessService(current_user.access_token)
    account_data = await lichess_service.get_account()
    
    if not account_data:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to fetch data from Lichess API",
        )
    
    # Update user in database
    user = await UserService.create_or_update_user(
        db,
        lichess_data=account_data,
        access_token=current_user.access_token,
        refresh_token=current_user.refresh_token,
        token_expires_at=current_user.token_expires_at,
    )
    
    # Parse and return updated data
    ratings = UserService.parse_ratings(user.ratings or {})
    profile = UserService.parse_profile(user.profile or {})
    
    return UserResponse(
        id=user.id,
        username=user.username,
        title=user.title,
        patron=user.patron,
        created_at_lichess=user.created_at_lichess,
        seen_at=user.seen_at,
        play_time_total=user.play_time_total or 0,
        play_time_tv=user.play_time_tv or 0,
        ratings=ratings,
        profile=profile,
    )


@router.get("/{username}", response_model=UserResponse)
async def get_user_profile(
    username: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Get public profile for any Lichess user.
    """
    # First check if we have this user in our database
    user = await UserService.get_user_by_username(db, username)
    
    if user:
        ratings = UserService.parse_ratings(user.ratings or {})
        profile = UserService.parse_profile(user.profile or {})
        
        return UserResponse(
            id=user.id,
            username=user.username,
            title=user.title,
            patron=user.patron,
            created_at_lichess=user.created_at_lichess,
            seen_at=user.seen_at,
            play_time_total=user.play_time_total or 0,
            play_time_tv=user.play_time_tv or 0,
            ratings=ratings,
            profile=profile,
        )
    
    # Fetch from Lichess API
    lichess_service = LichessService()
    user_data = await lichess_service.get_user_public(username)
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User '{username}' not found on Lichess",
        )
    
    # Parse Lichess response
    ratings_dict = {}
    perfs = user_data.get("perfs", {})
    for perf_type in ["bullet", "blitz", "rapid", "classical", "correspondence", "chess960", "puzzle"]:
        if perf_type in perfs:
            perf_data = perfs[perf_type]
            ratings_dict[perf_type] = {
                "rating": perf_data.get("rating", 0),
                "games": perf_data.get("games", 0),
                "prog": perf_data.get("prog", 0),
            }
    
    ratings = UserService.parse_ratings(ratings_dict)
    profile = UserService.parse_profile(user_data.get("profile", {}))
    
    # Parse timestamps
    from datetime import datetime
    created_at_lichess = None
    if user_data.get("createdAt"):
        created_at_lichess = datetime.fromtimestamp(user_data["createdAt"] / 1000)
    
    seen_at = None
    if user_data.get("seenAt"):
        seen_at = datetime.fromtimestamp(user_data["seenAt"] / 1000)
    
    play_time = user_data.get("playTime", {})
    
    return UserResponse(
        id=user_data["id"].lower(),
        username=user_data["username"],
        title=user_data.get("title"),
        patron=user_data.get("patron", False),
        created_at_lichess=created_at_lichess,
        seen_at=seen_at,
        play_time_total=play_time.get("total", 0),
        play_time_tv=play_time.get("tv", 0),
        ratings=ratings,
        profile=profile,
    )
