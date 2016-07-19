# [API reference](https://jsapi.apiary.io/previews/scoreboard6/reference)

# Setup Development Environment

-  Install [Docker](https://docs.docker.com/engine/installation/)
- `git clone http://bitbucket.org/wood1986/foosball`
- `cd server`
- `make devInitAll`

# Create mock players or matches

- `cd server/node/tools`
- `node creator.js --help`

# Query

`db.getCollection('matches').aggregate([
  {
    $match: { $or: [ { winners: "<playerId>" }, { losers: "<playerId>" } ] }
  },
  {
    $project: { "player": { $literal: "<playerId>" }, "playedAt": 1, "score": 1, "size": { $size: "$winners" }, "win": { $setIsSubset: [ ["<playerId>"] , "$winners" ] } }
  },
  {
    $group: {
      "_id": {
        "player": "$player",
        "win": "$win"
      },
      "sum": { $sum: "$score" },
      "count": { $sum: 1 }
    }
  }
])`
