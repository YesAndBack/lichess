from sqlalchemy import Column, String, DateTime, Integer, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum


class GameResult(str, enum.Enum):
    WIN = "win"
    LOSS = "loss"
    DRAW = "draw"


class GameStatus(str, enum.Enum):
    MATE = "mate"
    RESIGN = "resign"
    STALEMATE = "stalemate"
    TIMEOUT = "timeout"
    DRAW = "draw"
    OUT_OF_TIME = "outoftime"
    CHEAT = "cheat"
    NO_START = "noStart"
    UNKNOWN_FINISH = "unknownFinish"
    VARIANT_END = "variantEnd"


class Game(Base):
    __tablename__ = "games"
    
    id = Column(String, primary_key=True)  # Lichess game ID
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    
    # Game info
    rated = Column(Boolean, default=True)
    variant = Column(String, default="standard")  # standard, chess960, etc.
    speed = Column(String, nullable=False)  # bullet, blitz, rapid, classical
    perf_type = Column(String, nullable=False)  # blitz, rapid, etc.
    
    # Time control
    time_control_initial = Column(Integer, nullable=True)  # seconds
    time_control_increment = Column(Integer, nullable=True)  # seconds
    
    # Players
    white_username = Column(String, nullable=False)
    white_rating = Column(Integer, nullable=True)
    white_rating_diff = Column(Integer, nullable=True)
    black_username = Column(String, nullable=False)
    black_rating = Column(Integer, nullable=True)
    black_rating_diff = Column(Integer, nullable=True)
    
    # Result from user's perspective
    user_color = Column(String, nullable=False)  # white or black
    result = Column(SQLEnum(GameResult), nullable=False)
    status = Column(String, nullable=False)  # mate, resign, timeout, etc.
    winner = Column(String, nullable=True)  # white, black, or null for draw
    
    # Timestamps
    created_at = Column(DateTime, nullable=False)  # When game was played
    last_move_at = Column(DateTime, nullable=True)
    
    # Opening
    opening_eco = Column(String, nullable=True)
    opening_name = Column(String, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="games")
    
    def __repr__(self):
        return f"<Game {self.id} - {self.user_id}>"
