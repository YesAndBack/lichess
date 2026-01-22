import asyncio
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.celery_app import celery_app
from app.config import settings
from app.models.user import User
from app.services.lichess import LichessService
from app.services.game import GameService


def get_async_session():
    """Create async session for Celery tasks"""
    engine = create_async_engine(settings.DATABASE_URL)
    return async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def _sync_user_games_async(user_id: str, max_games: int = 100):
    """Async implementation of game sync"""
    SessionLocal = get_async_session()
    
    async with SessionLocal() as db:
        # Get user
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user or not user.access_token:
            return {"error": "User not found or no access token"}
        
        # Fetch games from Lichess
        lichess_service = LichessService(user.access_token)
        
        try:
            lichess_games = await lichess_service.get_user_games(
                username=user.username,
                max_games=max_games,
            )
        except Exception as e:
            return {"error": f"Failed to fetch games: {str(e)}"}
        
        # Save games
        saved_count = await GameService.save_games_from_lichess(
            db,
            user=user,
            lichess_games=lichess_games,
        )
        
        return {
            "user_id": user_id,
            "fetched": len(lichess_games),
            "saved": saved_count,
            "synced_at": datetime.utcnow().isoformat(),
        }


@celery_app.task(name="sync_user_games", bind=True)
def sync_user_games(self, user_id: str, max_games: int = 100):
    """
    Celery task to sync user's games from Lichess.
    Can be used for background sync or scheduled tasks.
    """
    loop = asyncio.get_event_loop()
    if loop.is_closed():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    try:
        result = loop.run_until_complete(_sync_user_games_async(user_id, max_games))
        return result
    except Exception as e:
        return {"error": str(e)}


@celery_app.task(name="sync_all_users_games")
def sync_all_users_games(max_games: int = 50):
    """
    Celery task to sync games for all users.
    Useful for scheduled background updates.
    """
    async def _sync_all():
        SessionLocal = get_async_session()
        results = []
        
        async with SessionLocal() as db:
            # Get all users with access tokens
            result = await db.execute(
                select(User).where(User.access_token.isnot(None))
            )
            users = result.scalars().all()
            
            for user in users:
                try:
                    sync_result = await _sync_user_games_async(user.id, max_games)
                    results.append(sync_result)
                except Exception as e:
                    results.append({"user_id": user.id, "error": str(e)})
        
        return results
    
    loop = asyncio.get_event_loop()
    if loop.is_closed():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    return loop.run_until_complete(_sync_all())
