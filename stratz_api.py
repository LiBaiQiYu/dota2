"""
STRATZ Dota 2 API Interface
API Documentation: https://stratz.com/api
"""

import requests
from typing import Optional, Dict, Any, List


class StratzAPI:
    """STRATZ API wrapper for Dota 2 data."""

    BASE_URL = "https://api.stratz.com/api/v1"

    def __init__(self, token: str):
        """
        Initialize with your STRATZ API token.

        Args:
            token: JWT Bearer token from STRATZ
        """
        self.token = token
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        })

    def _get(self, endpoint: str, params: Optional[Dict] = None) -> Dict[Any, Any]:
        """Make GET request to API."""
        url = f"{self.BASE_URL}/{endpoint}"
        response = self.session.get(url, params=params)
        response.raise_for_status()
        return response.json()

    def _post(self, endpoint: str, json: Dict) -> Dict[Any, Any]:
        """Make POST request to API (for GraphQL)."""
        url = f"{self.BASE_URL}/{endpoint}"
        response = self.session.post(url, json=json)
        response.raise_for_status()
        return response.json()

    # === Player APIs ===

    def get_player(self, steam_id: int) -> Dict[Any, Any]:
        """Get player profile and stats."""
        return self._get(f"player/{steam_id}")

    def get_player_matches(
        self,
        steam_id: int,
        limit: int = 20,
        offset: int = 0,
        start_date: Optional[int] = None,
        end_date: Optional[int] = None,
        hero_id: Optional[int] = None,
    ) -> Dict[Any, Any]:
        """Get player's match history."""
        params = {"limit": limit, "offset": offset}
        if start_date:
            params["startDate"] = start_date
        if end_date:
            params["endDate"] = end_date
        if hero_id:
            params["heroId"] = hero_id
        return self._get(f"player/{steam_id}/matches", params)

    def get_player_ranking(self, steam_id: int) -> Dict[Any, Any]:
        """Get player's rankings."""
        return self._get(f"player/{steam_id}/rankings")

    def get_player_ward_map(self, steam_id: int, limit: int = 100) -> Dict[Any, Any]:
        """Get player's ward map data."""
        return self._get(f"player/{steam_id}/wardMap", {"limit": limit})

    def get_player_word_cloud(self, steam_id: int) -> Dict[Any, Any]:
        """Get player's word cloud data."""
        return self._get(f"player/{steam_id}/wordCloud")

    # === Hero APIs ===

    def get_heroes(self) -> List[Dict[Any, Any]]:
        """Get all heroes list."""
        return self._get("hero")

    def get_hero(self, hero_id: int) -> Dict[Any, Any]:
        """Get specific hero details."""
        return self._get(f"hero/{hero_id}")

    def get_hero_matches(self, hero_id: int, limit: int = 20) -> Dict[Any, Any]:
        """Get recent matches for a hero."""
        return self._get(f"hero/{hero_id}/matches", {"limit": limit})

    def get_hero_matchups(self, hero_id: int) -> Dict[Any, Any]:
        """Get hero matchup data."""
        return self._get(f"hero/{hero_id}/matchups")

    def get_hero_performers(self, hero_id: int) -> Dict[Any, Any]:
        """Get best/worst performers for a hero."""
        return self._get(f"hero/{hero_id}/performers")

    # === Match APIs ===

    def get_match(self, match_id: int) -> Dict[Any, Any]:
        """Get full match details."""
        return self._get(f"match/{match_id}")

    def get_match_timing(self, match_id: int) -> Dict[Any, Any]:
        """Get match timing analysis."""
        return self._get(f"match/{match_id}/timing")

    def get_match_word_cloud(self, match_id: int) -> Dict[Any, Any]:
        """Get word cloud for match."""
        return self._get(f"match/{match_id}/wordCloud")

    # === League APIs ===

    def get_leagues(self) -> List[Dict[Any, Any]]:
        """Get all leagues."""
        return self._get("league")

    def get_league(self, league_id: int) -> Dict[Any, Any]:
        """Get specific league details."""
        return self._get(f"league/{league_id}")

    def get_league_matches(self, league_id: int, limit: int = 20) -> Dict[Any, Any]:
        """Get matches in a league."""
        return self._get(f"league/{league_id}/matches", {"limit": limit})

    # === Team APIs ===

    def get_teams(self) -> List[Dict[Any, Any]]:
        """Get all teams."""
        return self._get("team")

    def get_team(self, team_id: int) -> Dict[Any, Any]:
        """Get specific team details."""
        return self._get(f"team/{team_id}")

    def get_team_members(self, team_id: int) -> Dict[Any, Any]:
        """Get team members."""
        return self._get(f"team/{team_id}/member")

    # === General APIs ===

    def get_pro_player_stats(self) -> Dict[Any, Any]:
        """Get pro player statistics."""
        return self._get("stats/proPlayer")

    def get_top_hundred_players(self) -> List[Dict[Any, Any]]:
        """Get top 100 players leaderboard."""
        return self._get("leaderboard/top")

    # === GraphQL API ===

    def graphql(self, query: str, variables: Optional[Dict] = None) -> Dict[Any, Any]:
        """
        Execute GraphQL query against STRATZ API.

        Args:
            query: GraphQL query string
            variables: Optional variables for the query

        Returns:
            GraphQL response data
        """
        payload = {"query": query}
        if variables:
            payload["variables"] = variables
        result = self._post("graphql", payload)
        if "errors" in result:
            raise Exception(f"GraphQL Error: {result['errors']}")
        return result.get("data", {})


# === Example Usage ===

if __name__ == "__main__":
    # Initialize with your token
    TOKEN = "YOUR_STRATZ_TOKEN_HERE"
    api = StratzAPI(TOKEN)

    # Example: Get player data
    try:
        # Example with a known Steam ID (Arteezy: 70388657)
        player = api.get_player(70388657)
        print(f"Player: {player.get('displayName', 'Unknown')}")

        # Example: Get all heroes
        heroes = api.get_heroes()
        print(f"Total heroes: {len(heroes)}")

        # Example: Get a specific match
        # match = api.get_match(1234567890)
        # print(f"Match ID: {match.get('matchId')}")

    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error: {e}")
    except Exception as e:
        print(f"Error: {e}")
