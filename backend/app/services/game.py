from typing import Optional, List, Tuple
from datetime import datetime
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.game import Game, GameResult
from app.models.user import User
from app.schemas.game import GameResponse, GameFilters


class GameService:
    """Service for game operations"""
    
    @staticmethod
    async def get_user_games(
        db: AsyncSession,
        user_id: str,
        page: int = 1,
        page_size: int = 20,
        filters: Optional[GameFilters] = None,
    ) -> Tuple[List[Game], int]:
        """Get paginated games for a user with optional filters"""
        # Base query
        query = select(Game).where(Game.user_id == user_id)
        count_query = select(func.count()).select_from(Game).where(Game.user_id == user_id)
        
        # Apply filters
        if filters:
            if filters.perf_type:
                query = query.where(Game.perf_type == filters.perf_type)
                count_query = count_query.where(Game.perf_type == filters.perf_type)
            
            if filters.result:
                query = query.where(Game.result == filters.result)
                count_query = count_query.where(Game.result == filters.result)
            
            if filters.rated is not None:
                query = query.where(Game.rated == filters.rated)
                count_query = count_query.where(Game.rated == filters.rated)
            
            if filters.since:
                query = query.where(Game.created_at >= filters.since)
                count_query = count_query.where(Game.created_at >= filters.since)
            
            if filters.until:
                query = query.where(Game.created_at <= filters.until)
                count_query = count_query.where(Game.created_at <= filters.until)
        
        # Order by date descending
        query = query.order_by(desc(Game.created_at))
        
        # Pagination
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)
        
        # Execute queries
        result = await db.execute(query)
        games = result.scalars().all()
        
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        return list(games), total
    
    @staticmethod
    async def save_games_from_lichess(
        db: AsyncSession,
        user: User,
        lichess_games: List[dict],
    ) -> int:
        """Save games from Lichess API response"""
        saved_count = 0
        username_lower = user.username.lower()
        
        for game_data in lichess_games:
            game_id = game_data["id"]
            
            # Check if game already exists
            existing = await db.execute(
                select(Game).where(Game.id == game_id)
            )
            if existing.scalar_one_or_none():
                continue
            
            # Determine user's color
            players = game_data.get("players", {})
            white = players.get("white", {})
            black = players.get("black", {})
            
            white_user = white.get("user", {})
            black_user = black.get("user", {})
            
            white_username = white_user.get("name", white_user.get("id", "Anonymous"))
            black_username = black_user.get("name", black_user.get("id", "Anonymous"))
            
            if white_username.lower() == username_lower:
                user_color = "white"
            elif black_username.lower() == username_lower:
                user_color = "black"
            else:
                # User not found in game, skip
                continue
            
            # Determine result
            winner = game_data.get("winner")
            if winner is None:
                result = GameResult.DRAW
            elif winner == user_color:
                result = GameResult.WIN
            else:
                result = GameResult.LOSS
            
            # Parse timestamps
            created_at = datetime.fromtimestamp(game_data["createdAt"] / 1000)
            last_move_at = None
            if game_data.get("lastMoveAt"):
                last_move_at = datetime.fromtimestamp(game_data["lastMoveAt"] / 1000)
            
            # Parse time control
            clock = game_data.get("clock", {})
            time_control_initial = clock.get("initial")
            time_control_increment = clock.get("increment")
            
            # Parse opening
            opening = game_data.get("opening", {})
            opening_eco = opening.get("eco")
            opening_name = opening.get("name")
            
            # Create game record
            game = Game(
                id=game_id,
                user_id=user.id,
                rated=game_data.get("rated", True),
                variant=game_data.get("variant", "standard"),
                speed=game_data.get("speed", "unknown"),
                perf_type=game_data.get("perf", game_data.get("speed", "unknown")),
                time_control_initial=time_control_initial,
                time_control_increment=time_control_increment,
                white_username=white_username,
                white_rating=white.get("rating"),
                white_rating_diff=white.get("ratingDiff"),
                black_username=black_username,
                black_rating=black.get("rating"),
                black_rating_diff=black.get("ratingDiff"),
                user_color=user_color,
                result=result,
                status=game_data.get("status", "unknown"),
                winner=winner,
                created_at=created_at,
                last_move_at=last_move_at,
                opening_eco=opening_eco,
                opening_name=opening_name,
            )
            
            db.add(game)
            saved_count += 1
        
        if saved_count > 0:
            # Update user's last sync time
            user.last_games_sync = datetime.utcnow()
            await db.commit()
        
        return saved_count
    
    @staticmethod
    def game_to_response(game: Game) -> GameResponse:
        """Convert Game model to GameResponse schema"""
        # Determine opponent
        if game.user_color == "white":
            opponent_username = game.black_username
            opponent_rating = game.black_rating
        else:
            opponent_username = game.white_username
            opponent_rating = game.white_rating
        
        return GameResponse(
            id=game.id,
            rated=game.rated,
            variant=game.variant,
            speed=game.speed,
            perf_type=game.perf_type,
            time_control_initial=game.time_control_initial,
            time_control_increment=game.time_control_increment,
            white_username=game.white_username,
            white_rating=game.white_rating,
            white_rating_diff=game.white_rating_diff,
            black_username=game.black_username,
            black_rating=game.black_rating,
            black_rating_diff=game.black_rating_diff,
            user_color=game.user_color,
            result=game.result,
            status=game.status,
            winner=game.winner,
            created_at=game.created_at,
            last_move_at=game.last_move_at,
            opening_eco=game.opening_eco,
            opening_name=game.opening_name,
            opponent_username=opponent_username,
            opponent_rating=opponent_rating,
            lichess_url=f"https://lichess.org/{game.id}",
        )
