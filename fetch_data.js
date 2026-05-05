/**
 * Node.js script to fetch player data from STRATZ API
 * Run: node fetch_data.js <steamId>
 * Example: node fetch_data.js 70388657
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const STEAM_ID = process.argv[2] || "109902856";
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
        names {
          name
        }
        matchCount
        winCount
        imp
        firstMatchDate
        lastMatchDate
        leaderboardRanks {
          rank
        }
      }
    }
  `;

  const matchesQuery = `
    query GetPlayerMatches($steamAccountId: Long!) {
      player(steamAccountId: $steamAccountId) {
        matches(request: {}) {
          id
          didRadiantWin
          durationSeconds
          startDateTime
          players {
            steamAccountId
            heroId
            kills
            deaths
            assists
            isRadiant
          }
        }
      }
    }
  `;

  try {
    console.log("Fetching player info...");
    const playerData = await graphql(playerQuery, { steamAccountId: parseInt(steamId) });

    console.log("Fetching matches...");
    const matchesData = await graphql(matchesQuery, { steamAccountId: parseInt(steamId) });

    const result = {
      steamId: steamId,
      timestamp: new Date().toISOString(),
      player: playerData.player,
      matches: (matchesData.player?.matches || []).slice(0, 20)
    };

    // Save to JSON
    const outputPath = path.join(__dirname, "data.json");
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`Data saved to ${outputPath}`);
    console.log(`Player: ${result.player?.steamAccount?.name || result.player?.names?.[0] || "Unknown"}`);
    console.log(`Matches: ${result.matches.length}`);

  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

fetchPlayerData(STEAM_ID);
