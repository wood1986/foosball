# [API reference](https://jsapi.apiary.io/previews/foosball/reference)

# Setup Development Environment

-  Install [Docker](https://docs.docker.com/engine/installation/)
- `git clone http://bitbucket.org/wood1986/foosball`
- `cd server`
- `make devInitAll`

# Create mock players or matches

- `cd server/node/tools`
- `node creator.js --help`

# Sample query

- net score group by player and type
`db.getCollection('matches').aggregate([
  {
    "$project": {
      "winners" : {
        "$map": {
          input: "$winners",
          as: "a",
          in: {
            "player": "$$a",
            "score": { $multiply: [ "$score", 1 ] }
          }
        }
      },
      "losers": {
        "$map": {
          input: "$losers",
          as: "a",
          in: {
            "player": "$$a",
            "score": { $multiply: [ "$score", -1 ] }
          }
        }
      },
      "playedAt": 1,
    }
  },
  {
    $project: {
      "players": {
        $setUnion: ["$winners", "$losers"]
      },
      "playedAt": 1,
      "size": { "$size": "$winners" }
    }
  },
  {
    $unwind: "$players"
  },
  {
    $project: {
      "player": "$players.player",
      "score": "$players.score",
      "playedAt": 1,
      "size": 1
    }
  },
  {
    $group: {
      "_id": {
        "player": "$player",
        "size": "$size"
      },
      "score": {
        $sum: "$score"
      }
    }
  }
])`

- net score for a single player group by type
`db.getCollection('matches').aggregate([
  {
    $match: {
      $or: [
        { winners: "e6EVrvMQTjW6R4fLvYeynw" },
        { losers:"e6EVrvMQTjW6R4fLvYeynw" }
      ]
    }
  },
  {
    $project: {
      player: { $literal: "e6EVrvMQTjW6R4fLvYeynw" },
      score: {
         $multiply: [
          {
            $cond: {
              if: { $setIsSubset: [ ["e6EVrvMQTjW6R4fLvYeynw"], "$winners" ] }, then: 1, else: -1
            }
          },
          "$score"
        ]
      },
      playedAt: 1,
      size: { "$size": "$winners" }
    }
  },
  {
    $group: {
      "_id": {
        "player": "$player",
        "size": "$size"
      },
      "score": {
        $sum: "$score"
      }
    }
  }
])`
