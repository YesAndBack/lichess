from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.game import GameResponse, GameListResponse, GameFilters, GameResult
from app.services.game import GameService
from app.services.lichess import LichessService
from app.api.deps import get_current_user
from app.models.user import User


router = APIRouter(prefix="/games", tags=["Games"])


@router.get("/me", response_model=GameListResponse)
async def get_my_games(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    perf_type: Optional[str] = Query(None, description="Filter by game type (blitz, rapid, etc.)"),
    result: Optional[GameResult] = Query(None, description="Filter by result (win, loss, draw)"),
    rated: Optional[bool] = Query(None, description="Filter by rated/casual"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get current user's game history with pagination and filters.
    """
    filters = GameFilters(
        perf_type=perf_type,
        result=result,
        rated=rated,
    )
    
    games, total = await GameService.get_user_games(
        db,
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        filters=filters,
    )
    
    # Convert to response format
    game_responses = [GameService.game_to_response(g) for g in games]
    
    has_more = (page * page_size) < total
    
    return GameListResponse(
        games=game_responses,
        total=total,
        page=page,
        page_size=page_size,
        has_more=has_more,
    )


@router.post("/me/sync")
async def sync_my_games(
    max_games: int = Query(50, ge=1, le=300, description="Maximum games to fetch"),
    perf_type: Optional[str] = Query(None, description="Filter by game type"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Sync games from Lichess API to local database.
    """
    if not current_user.access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No Lichess token available. Please log in again.",
        )
    
    # Fetch games from Lichess
    lichess_service = LichessService(current_user.access_token)
    
    try:
        lichess_games = await lichess_service.get_user_games(
            username=current_user.username,
            max_games=max_games,
            perf_type=perf_type,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch games from Lichess: {str(e)}",
        )
    
    # Save games to database
    saved_count = await GameService.save_games_from_lichess(
        db,
        user=current_user,
        lichess_games=lichess_games,
    )
    
    return {
        "message": f"Successfully synced {saved_count} new games",
        "fetched": len(lichess_games),
        "saved": saved_count,
    }


@router.get("/me/{game_id}", response_model=GameResponse)
async def get_my_game(
    game_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a specific game by ID.
    """
    from sqlalchemy import select
    from app.models.game import Game
    
    result = await db.execute(
        select(Game).where(
            Game.id == game_id,
            Game.user_id == current_user.id,
        )
    )
    game = result.scalar_one_or_none()
    
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )
    
    return GameService.game_to_response(game)


@router.get("/stats/me")
async def get_my_game_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get game statistics for current user.
    """
    from sqlalchemy import select, func
    from app.models.game import Game, GameResult as DBGameResult
    
    # Get counts by result
    stats = {}
    
    for result in [DBGameResult.WIN, DBGameResult.LOSS, DBGameResult.DRAW]:
        count_result = await db.execute(
            select(func.count()).select_from(Game).where(
                Game.user_id == current_user.id,
                Game.result == result,
            )
        )
        stats[result.value] = count_result.scalar()
    
    # Get counts by perf type
    perf_stats_result = await db.execute(
        select(Game.perf_type, func.count()).where(
            Game.user_id == current_user.id
        ).group_by(Game.perf_type)
    )
    perf_stats = {row[0]: row[1] for row in perf_stats_result.all()}
    
    # Total games
    total_result = await db.execute(
        select(func.count()).select_from(Game).where(
            Game.user_id == current_user.id
        )
    )
    total = total_result.scalar()
    
    return {
        "total": total,
        "results": stats,
        "by_type": perf_stats,
        "win_rate": round(stats.get("win", 0) / total * 100, 1) if total > 0 else 0,
    }
