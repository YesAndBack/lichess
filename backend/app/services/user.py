from typing import Optional
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.user import UserRatings, UserRating, UserProfile


class UserService:
    """Service for user operations"""
    
    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
        """Get user by ID"""
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
        """Get user by username"""
        result = await db.execute(
            select(User).where(User.username.ilike(username))
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create_or_update_user(
        db: AsyncSession,
        lichess_data: dict,
        access_token: str,
        refresh_token: Optional[str] = None,
        token_expires_at: Optional[datetime] = None,
    ) -> User:
        """Create or update user from Lichess account data"""
        user_id = lichess_data["id"].lower()
        
        # Check if user exists
        user = await UserService.get_user_by_id(db, user_id)
        
        # Parse ratings from perfs
        ratings = {}
        perfs = lichess_data.get("perfs", {})
        for perf_type in ["bullet", "blitz", "rapid", "classical", "correspondence", "chess960", "puzzle"]:
            if perf_type in perfs:
                perf_data = perfs[perf_type]
                ratings[perf_type] = {
                    "rating": perf_data.get("rating", 0),
                    "games": perf_data.get("games", 0),
                    "prog": perf_data.get("prog", 0),
                    "rd": perf_data.get("rd"),
                    "prov": perf_data.get("prov"),
                }
        
        # Parse timestamps
        created_at_lichess = None
        if lichess_data.get("createdAt"):
            created_at_lichess = datetime.fromtimestamp(lichess_data["createdAt"] / 1000)
        
        seen_at = None
        if lichess_data.get("seenAt"):
            seen_at = datetime.fromtimestamp(lichess_data["seenAt"] / 1000)
        
        # Parse play time
        play_time = lichess_data.get("playTime", {})
        play_time_total = play_time.get("total", 0)
        play_time_tv = play_time.get("tv", 0)
        
        if user:
            # Update existing user
            user.username = lichess_data["username"]
            user.title = lichess_data.get("title")
            user.patron = lichess_data.get("patron", False)
            user.created_at_lichess = created_at_lichess
            user.seen_at = seen_at
            user.play_time_total = play_time_total
            user.play_time_tv = play_time_tv
            user.ratings = ratings
            user.profile = lichess_data.get("profile", {})
            user.access_token = access_token
            user.refresh_token = refresh_token
            user.token_expires_at = token_expires_at
            user.updated_at = datetime.utcnow()
        else:
            # Create new user
            user = User(
                id=user_id,
                lichess_id=lichess_data["id"],
                username=lichess_data["username"],
                title=lichess_data.get("title"),
                patron=lichess_data.get("patron", False),
                created_at_lichess=created_at_lichess,
                seen_at=seen_at,
                play_time_total=play_time_total,
                play_time_tv=play_time_tv,
                ratings=ratings,
                profile=lichess_data.get("profile", {}),
                access_token=access_token,
                refresh_token=refresh_token,
                token_expires_at=token_expires_at,
            )
            db.add(user)
        
        await db.commit()
        await db.refresh(user)
        return user
    
    @staticmethod
    async def update_user_tokens(
        db: AsyncSession,
        user: User,
        access_token: str,
        refresh_token: Optional[str] = None,
        token_expires_at: Optional[datetime] = None,
    ) -> User:
        """Update user's OAuth tokens"""
        user.access_token = access_token
        user.refresh_token = refresh_token
        user.token_expires_at = token_expires_at
        user.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(user)
        return user
    
    @staticmethod
    async def clear_user_tokens(db: AsyncSession, user: User) -> User:
        """Clear user's OAuth tokens (logout)"""
        user.access_token = None
        user.refresh_token = None
        user.token_expires_at = None
        user.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(user)
        return user
    
    @staticmethod
    def parse_ratings(ratings_dict: dict) -> UserRatings:
        """Parse ratings dict to UserRatings schema"""
        ratings = UserRatings()
        
        for perf_type in ["bullet", "blitz", "rapid", "classical", "correspondence", "chess960", "puzzle"]:
            if perf_type in ratings_dict:
                data = ratings_dict[perf_type]
                rating = UserRating(
                    rating=data.get("rating", 0),
                    games=data.get("games", 0),
                    prog=data.get("prog", 0),
                    rd=data.get("rd"),
                    prov=data.get("prov"),
                )
                setattr(ratings, perf_type, rating)
        
        return ratings
    
    @staticmethod
    def parse_profile(profile_dict: dict) -> Optional[UserProfile]:
        """Parse profile dict to UserProfile schema"""
        if not profile_dict:
            return None
        
        return UserProfile(
            country=profile_dict.get("country"),
            location=profile_dict.get("location"),
            bio=profile_dict.get("bio"),
            firstName=profile_dict.get("firstName"),
            lastName=profile_dict.get("lastName"),
            links=profile_dict.get("links"),
        )
