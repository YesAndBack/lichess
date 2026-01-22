from sqlalchemy import Column, String, DateTime, Integer, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)  # Lichess username
    lichess_id = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    
    # Profile info
    title = Column(String, nullable=True)  # GM, IM, etc.
    patron = Column(Boolean, default=False)
    created_at_lichess = Column(DateTime, nullable=True)
    seen_at = Column(DateTime, nullable=True)
    play_time_total = Column(Integer, default=0)
    play_time_tv = Column(Integer, default=0)
    
    # Ratings stored as JSON
    # Format: {"blitz": {"rating": 1500, "games": 100, "prog": 10}, ...}
    ratings = Column(JSON, default=dict)
    
    # Profile
    profile = Column(JSON, default=dict)  # bio, country, location, etc.
    
    # OAuth tokens
    access_token = Column(String, nullable=True)
    refresh_token = Column(String, nullable=True)
    token_expires_at = Column(DateTime, nullable=True)
    
    # App metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_games_sync = Column(DateTime, nullable=True)
    
    # Relationships
    games = relationship("Game", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User {self.username}>"
