from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class GameResult(str, Enum):
    WIN = "win"
    LOSS = "loss"
    DRAW = "draw"


class GameSpeed(str, Enum):
    ULTRA_BULLET = "ultraBullet"
    BULLET = "bullet"
    BLITZ = "blitz"
    RAPID = "rapid"
    CLASSICAL = "classical"
    CORRESPONDENCE = "correspondence"


class GameBase(BaseModel):
    id: str
    rated: bool = True
    variant: str = "standard"
    speed: str
    perf_type: str


class GameResponse(BaseModel):
    id: str
    rated: bool
    variant: str
    speed: str
    perf_type: str
    
    # Time control
    time_control_initial: Optional[int] = None
    time_control_increment: Optional[int] = None
    
    # Players
    white_username: str
    white_rating: Optional[int] = None
    white_rating_diff: Optional[int] = None
    black_username: str
    black_rating: Optional[int] = None
    black_rating_diff: Optional[int] = None
    
    # Result
    user_color: str
    result: GameResult
    status: str
    winner: Optional[str] = None
    
    # Timestamps
    created_at: datetime
    last_move_at: Optional[datetime] = None
    
    # Opening
    opening_eco: Optional[str] = None
    opening_name: Optional[str] = None
    
    # Computed fields
    opponent_username: Optional[str] = None
    opponent_rating: Optional[int] = None
    lichess_url: Optional[str] = None
    
    class Config:
        from_attributes = True


class GameListResponse(BaseModel):
    games: List[GameResponse]
    total: int
    page: int
    page_size: int
    has_more: bool


class GameFilters(BaseModel):
    perf_type: Optional[str] = None  # blitz, rapid, classical, etc.
    result: Optional[GameResult] = None
    rated: Optional[bool] = None
    since: Optional[datetime] = None
    until: Optional[datetime] = None


class LichessGame(BaseModel):
    """Schema for Lichess API game response"""
    id: str
    rated: bool = True
    variant: str = "standard"
    speed: str
    perf: str
    createdAt: int
    lastMoveAt: Optional[int] = None
    status: str
    players: dict
    winner: Optional[str] = None
    opening: Optional[dict] = None
    clock: Optional[dict] = None
