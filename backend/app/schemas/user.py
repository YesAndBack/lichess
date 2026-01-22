from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class UserRating(BaseModel):
    rating: int = 0
    games: int = 0
    prog: int = 0  # Progress/rating change
    rd: Optional[int] = None  # Rating deviation
    prov: Optional[bool] = None  # Provisional rating


class UserRatings(BaseModel):
    bullet: Optional[UserRating] = None
    blitz: Optional[UserRating] = None
    rapid: Optional[UserRating] = None
    classical: Optional[UserRating] = None
    correspondence: Optional[UserRating] = None
    chess960: Optional[UserRating] = None
    puzzle: Optional[UserRating] = None


class UserProfile(BaseModel):
    country: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    links: Optional[str] = None


class UserBase(BaseModel):
    username: str
    title: Optional[str] = None
    patron: bool = False


class UserCreate(UserBase):
    lichess_id: str
    access_token: str
    refresh_token: Optional[str] = None
    token_expires_at: Optional[datetime] = None


class UserResponse(BaseModel):
    id: str
    username: str
    title: Optional[str] = None
    patron: bool = False
    created_at_lichess: Optional[datetime] = None
    seen_at: Optional[datetime] = None
    play_time_total: int = 0
    play_time_tv: int = 0
    ratings: UserRatings = Field(default_factory=UserRatings)
    profile: Optional[UserProfile] = None
    
    class Config:
        from_attributes = True


class LichessAccount(BaseModel):
    """Schema for Lichess API account response"""
    id: str
    username: str
    title: Optional[str] = None
    patron: Optional[bool] = False
    createdAt: Optional[int] = None
    seenAt: Optional[int] = None
    playTime: Optional[dict] = None
    perfs: Optional[dict] = None
    profile: Optional[dict] = None
    count: Optional[dict] = None
    url: Optional[str] = None
