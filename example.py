"""
Example usage of STRATZ API with your token
"""

from stratz_api import StratzAPI
import traceback

# Your token
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdWJqZWN0IjoiZDkyZDc2ODEtMmZhNC00ZTIxLThhMjAtNGUxMjJiNmFkYzU0IiwiU3RlYW1JZCI6IjEwOTkwMjg1NiIsIkFQSVVzZXIiOiJ0cnVlIiwibmJmIjoxNzc3OTgxNzY3LCJleHAiOjE4MDk1MTc3NjcsImlhdCI6MTc3Nzk4MTc2NywiaXNzIjoiaHR0cHM6Ly9hcGkuc3RyYXR6LmNvbSJ9.jyVnuWywgm34Ll3nsVVgqxAlVq_X--j48eVS225NCx0"

api = StratzAPI(TOKEN)

print("Testing STRATZ API...")
print("=" * 50)

# Test via GraphQL (primary API method)
print("\n1. GraphQL - Get Player Data:")
query = """
query {
  player(steamAccountId: 70388657) {
    id
    steamAccountId
    displayName
    avatar
    leaderboardRank
    stats {
      heroHealing
      towerDamage
      kills
      deaths
      assists
    }
  }
}
"""
try:
    result = api.graphql(query)
    print(f"Success: {result}")
except Exception as e:
    print(f"Error: {e}")
    traceback.print_exc()

# Test via GraphQL - Get heroes
print("\n2. GraphQL - Get Heroes:")
query_heroes = """
query {
  heroes {
    id
    name
    displayName
    shortName
  }
}
"""
try:
    result = api.graphql(query_heroes)
    heroes = result.get("heroes", [])
    print(f"Total heroes: {len(heroes)}")
    if heroes:
        print(f"First hero: {heroes[0]}")
except Exception as e:
    print(f"Error: {e}")

# Test via REST - Get player (if available)
print("\n3. REST - Get Player:")
try:
    player = api.get_player(70388657)
    print(f"Player: {player}")
except Exception as e:
    print(f"Error: {e}")

# Test via REST - Get heroes
print("\n4. REST - Get Heroes:")
try:
    heroes = api.get_heroes()
    print(f"Result type: {type(heroes)}")
    print(f"Result: {heroes}")
except Exception as e:
    print(f"Error: {e}")
    traceback.print_exc()
