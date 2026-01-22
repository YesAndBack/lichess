import httpx
from typing import Optional, List, AsyncGenerator
from datetime import datetime
import json

from app.config import settings


class LichessService:
    """Service for interacting with Lichess API"""
    
    BASE_URL = "https://lichess.org"
    API_URL = "https://lichess.org/api"
    
    def __init__(self, access_token: Optional[str] = None):
        self.access_token = access_token
    
    def _get_headers(self) -> dict:
        headers = {"Accept": "application/json"}
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        return headers
    
    async def get_account(self) -> Optional[dict]:
        """Get the authenticated user's account info"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.API_URL}/account",
                headers=self._get_headers(),
                timeout=30.0
            )
            if response.status_code == 200:
                return response.json()
            return None
    
    async def get_user_public(self, username: str) -> Optional[dict]:
        """Get public info for any user"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.API_URL}/user/{username}",
                headers={"Accept": "application/json"},
                timeout=30.0
            )
            if response.status_code == 200:
                return response.json()
            return None
    
    async def get_user_games(
        self,
        username: str,
        max_games: int = 50,
        perf_type: Optional[str] = None,
        since: Optional[datetime] = None,
        until: Optional[datetime] = None,
        rated: Optional[bool] = None,
    ) -> List[dict]:
        """
        Get user's games from Lichess API
        Returns games as NDJSON stream
        """
        params = {
            "max": min(max_games, 300),  # Lichess limit
            "opening": "true",
            "clocks": "true",
            "pgnInJson": "false",
        }
        
        if perf_type:
            params["perfType"] = perf_type
        if since:
            params["since"] = int(since.timestamp() * 1000)
        if until:
            params["until"] = int(until.timestamp() * 1000)
        if rated is not None:
            params["rated"] = str(rated).lower()
        
        games = []
        
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "GET",
                f"{self.API_URL}/games/user/{username}",
                params=params,
                headers={
                    "Accept": "application/x-ndjson",
                    **({"Authorization": f"Bearer {self.access_token}"} if self.access_token else {})
                },
                timeout=60.0
            ) as response:
                if response.status_code != 200:
                    return []
                
                async for line in response.aiter_lines():
                    if line.strip():
                        try:
                            game = json.loads(line)
                            games.append(game)
                        except json.JSONDecodeError:
                            continue
        
        return games
    
    async def get_user_games_count(self, username: str) -> Optional[dict]:
        """Get count of games by type for a user"""
        user_data = await self.get_user_public(username)
        if user_data and "count" in user_data:
            return user_data.get("count")
        return None
    
    @staticmethod
    async def exchange_code_for_token(
        code: str,
        code_verifier: str,
    ) -> Optional[dict]:
        """Exchange authorization code for access token"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{LichessService.BASE_URL}/api/token",
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "code_verifier": code_verifier,
                    "redirect_uri": settings.LICHESS_REDIRECT_URI,
                    "client_id": settings.LICHESS_CLIENT_ID,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=30.0
            )
            if response.status_code == 200:
                return response.json()
            print(f"Token exchange error: {response.status_code} - {response.text}")
            return None
    
    @staticmethod
    async def revoke_token(access_token: str) -> bool:
        """Revoke an access token (logout)"""
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{LichessService.BASE_URL}/api/token",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=30.0
            )
            return response.status_code == 204
