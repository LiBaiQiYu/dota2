/**
 * Introspection query to get STRATZ API schema
 */

const https = require("https");

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdWJqZWN0IjoiZDkyZDc2ODEtMmZhNC00ZTIxLThhMjAtNGUxMjJiNmFkYzU0IiwiU3RlYW1JZCI6IjEwOTkwMjg1NiIsIkFQSVVzZXIiOiJ0cnVlIiwibmJmIjoxNzc3OTgxNzY3LCJleHAiOjE4MDk1MTc3NjcsImlhdCI6MTc3Nzk4MTc2NywiaXNzIjoiaHR0cHM6Ly9hcGkuc3RyYXR6LmNvbSJ9.jyVnuWywgm34Ll3nsVVgqxAlVq_X--j48eVS225NCx0";

const introspectionQuery = `
{
  __schema {
    types {
      name
      fields {
        name
        type {
          name
          kind
        }
        args {
          name
          type {
            name
            kind
          }
        }
      }
    }
  }
}
`;

const postData = JSON.stringify({ query: introspectionQuery });

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
        console.log("Errors:", JSON.stringify(result.errors, null, 2));
      } else {
        // Find PlayerType
        const types = result.data.__schema.types;
        const playerType = types.find(t => t.name === "PlayerType");
        const matchType = types.find(t => t.name === "MatchType");

        console.log("=== PlayerType Fields ===");
        if (playerType) {
          playerType.fields.forEach(f => {
            console.log(`  ${f.name}: ${f.type.name || f.type.kind}`);
          });
        }

        console.log("\n=== MatchType Fields ===");
        if (matchType) {
          matchType.fields.forEach(f => {
            console.log(`  ${f.name}: ${f.type.name || f.type.kind}`);
          });
        }
      }
    } catch (e) {
      console.log("Raw response:", data.substring(0, 5000));
    }
  });
});

req.on("error", (e) => console.error("Error:", e));
req.write(postData);
req.end();
