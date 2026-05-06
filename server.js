/**
 * Node.js server with API endpoint to fetch STRATZ data
 * Run: node server.js
 */

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const PORT = 3001;
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdWJqZWN0IjoiZDkyZDc2ODEtMmZhNC00ZTIxLThhMjAtNGUxMjJiNmFkYzU0IiwiU3RlYW1JZCI6IjEwOTkwMjg1NiIsIkFQSVVzZXIiOiJ0cnVlIiwibmJmIjoxNzc3OTgxNzY3LCJleHAiOjE4MDk1MTc3NjcsImlhdCI6MTc3Nzk4MTc2NywiaXNzIjoiaHR0cHM6Ly9hcGkuc3RyYXR6LmNvbSJ9.jyVnuWywgm34Ll3nsVVgqxAlVq_X--j48eVS225NCx0";

function graphql(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query, variables });

    const options = {
      hostname: "api.stratz.com",
      port: 443,
      path: "/graphql",
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "STRATZ_API"
      }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          const result = JSON.parse(data);
          if (result.errors) {
            reject(new Error(result.errors[0].message));
          } else {
            resolve(result.data);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

async function fetchPlayerData(steamId) {
  console.log(`Fetching data for Steam ID: ${steamId}...`);

  const playerQuery = `
    query GetPlayer($steamAccountId: Long!) {
      player(steamAccountId: $steamAccountId) {
        steamAccountId
        steamAccount {
          id
          name
          avatar
        }
        names { name }
        matchCount
        winCount
        imp
        firstMatchDate
        lastMatchDate
        leaderboardRanks { rank }
      }
    }
  `;

  const matchesQuery = `
    query GetPlayerMatches($steamAccountId: Long!) {
      player(steamAccountId: $steamAccountId) {
        matches(request: {skip: 0, take: 100}) {
          id
          didRadiantWin
          durationSeconds
          startDateTime
          bottomLaneOutcome
          midLaneOutcome
          topLaneOutcome
          players {
            matchId
            playerSlot
            steamAccountId
            steamAccount {
              name
            }
            isRadiant
            isVictory
            heroId
            gameVersionId
            kills
            deaths
            assists
            leaverStatus
            numLastHits
            numDenies
            goldPerMinute
            networth
            experiencePerMinute
            level
            gold
            goldSpent
            heroDamage
            towerDamage
            heroHealing
            partyId
            isRandom
            lane
            position
            streakPrediction
            intentionalFeeding
            role
            roleBasic
            imp
            award
            item0Id
            item1Id
            item2Id
            item3Id
            item4Id
            item5Id
            backpack0Id
            backpack1Id
            backpack2Id
            neutral0Id
            behavior
            invisibleSeconds
            dotaPlusHeroXp
            variant
          }
        }
      }
    }
  `;

  const heroesQuery = `
    query GetHeroes {
      constants {
        heroes {
          id
          shortName
          displayName
          stats {
            primaryAttributeEnum
          }
        }
      }
    }
  `;

  const matchDetailQuery = `
    query GetMatchDetails($matchIds: [Long]!) {
      matches(ids: $matchIds) {
        id
        didRadiantWin
        durationSeconds
        startDateTime
        bottomLaneOutcome
        midLaneOutcome
        topLaneOutcome
        players {
          matchId
          playerSlot
          steamAccountId
          steamAccount {
            name
          }
          isRadiant
          isVictory
          heroId
          gameVersionId
          kills
          deaths
          assists
          leaverStatus
          numLastHits
          numDenies
          goldPerMinute
          networth
          experiencePerMinute
          level
          gold
          goldSpent
          heroDamage
          towerDamage
          heroHealing
          partyId
          isRandom
          lane
          position
          streakPrediction
          intentionalFeeding
          role
          roleBasic
          imp
          award
          item0Id
          item1Id
          item2Id
          item3Id
          item4Id
          item5Id
          backpack0Id
          backpack1Id
          backpack2Id
          neutral0Id
          behavior
          invisibleSeconds
          dotaPlusHeroXp
          variant
        }
      }
    }
  `;

  try {
    console.log("Fetching player info...");
    const playerData = await graphql(playerQuery, { steamAccountId: parseInt(steamId) });

    console.log("Fetching matches...");
    const matchesData = await graphql(matchesQuery, { steamAccountId: parseInt(steamId) });

    console.log("Fetching heroes...");
    const heroesData = await graphql(heroesQuery);

    const result = {
      steamId: steamId,
      timestamp: new Date().toISOString(),
      player: playerData.player,
      matches: (matchesData.player?.matches || []).slice(0, 100),
      heroes: heroesData.constants?.heroes || []
    };

    console.log(`Success! Player: ${result.player?.steamAccount?.name || "Unknown"}, Matches: ${result.matches.length}, Heroes: ${result.heroes.length}`);
    return result;

  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // API endpoint: GET /api/fetch?steamId=xxx
  if (pathname === "/api/fetch") {
    const steamId = url.searchParams.get("steamId") || "109902856";

    res.setHeader("Content-Type", "application/json");

    try {
      const data = await fetchPlayerData(steamId);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, data }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
    return;
  }

  // Serve static files
  let filePath = pathname === "/" ? "/index.html" : pathname;
  filePath = path.join(__dirname, filePath);

  const ext = path.extname(filePath);
  const contentTypes = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json"
  };

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }
    res.writeHead(200, { "Content-Type": contentTypes[ext] || "text/plain" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/fetch?steamId=109902856`);
});
