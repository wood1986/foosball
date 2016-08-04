let _ = require("lodash"),
    async = require("async"),
    utils = require("./utils.js"),
    mongo = require("./mongo.js")();
    
let createRatings = (players, Row, Rol, K, G, F, Dw, Dl, Ew, El, Rn, match, createdAt) => {
  return _.map(
    players,
    (player) => {
      return {
        "_id": utils.uuid(),
        Row,
        Rol,
        K,
        G,
        F,
        Dw,
        Dl,
        Ew,
        El,
        player,
        match,
        points: Rn / players.length,
        createdAt
      }; 
    }
  );
};

module.exports.run = (F, isFinalize, socket) => {
  let matchesCollection = mongo.collection("matches"),
    ratingsCollection = mongo.collection("ratings");
    
  async.auto({
    "match": (callback) => {
      matchesCollection.findOne({
        "state": { "$exists": false }
      }, {
          "sort": { "playedAt": 1 }
        }, callback);
    },
    "ratings": ["match", (results, callback) => {
      let match = results.match;

      if (!match) {
        callback(false);
        return;
      }

      ratingsCollection.aggregate(
        [
          {
            "$match": {
              "$and": [
                {
                  "player": { "$in": _.flattenDeep([match.winners, match.losers]) },
                  "createdAt": { "$lte": match.playedAt }
                }
              ]
            }
          },
          { "$sort": { "createdAt": -1 } },
          {
            "$group": {
              "_id": "$player",
              "points": { "$first": "$point" }
            }
          }
        ],
        {},
        callback
      )
    }],
    "newRatings": ["match", "ratings", (results, callback) => {
      let match = results.match,
        ratings = _.reduce(
          results.ratings,
          (result, value) => {
            result[value.player] = value.points; return result;
          },
          {}
        ),
        Row = _.reduce(match.winners, (result, player) => { return result + (ratings[player] || 0) }, 0),
        Rol = _.reduce(match.losers, (result, player) => { return result + (ratings[player] || 0) }, 0),
        K = match.K,
        G = match.G,
        Dw = Rol - Row,
        Dl = Row - Rol,
        Ew = 1.0 / (Math.pow(10, -Dw / F) + 1),
        El = 1.0 / (Math.pow(10, -Dl / F) + 1),
        Rnw = Row + G * K * (1 - Ew),
        Rnl = Rol + G * K * (0 - El),
        createdAt = Date.now();
      
      let docs = [].concat(createRatings(match.winners, Row, Rol, K, G, F, Dw, Dl, Ew, El, Rnw, match._id, createdAt)).concat(createRatings(match.losers, Row, Rol, K, G, F, Dw, Dl, Ew, El, Rnl, match._id, createdAt));
        
      ratingsCollection.insertMany(
        docs,
        {
          "w": 1,
          "j": true
        },
        (err) => {
          callback(err, docs);
        }
      );
    }],
    "newMatch": ["newRatings", "match", (results, callback) => {
      matchesCollection.updateOne(
        {
          "_id": results.match
        },
        {
          "$set": { "state": isFinalize ? 1 : 0 },
        },
        {
          "upsert": true,
          "w": 1,
          "j": true
        },
        callback
      );
    }],
    "io": ["newRatings", (results, callback) => {
      if (socket) {
        socket.send(results);
      }
      
      callback();
    }]
  });
}
