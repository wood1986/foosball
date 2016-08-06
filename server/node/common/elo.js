let _ = require("lodash"),
    async = require("async"),
    utils = require("./utils.js"),
    mongo = require("./mongo.js")(),
    matchesCollection = mongo.collection("matches"),
    ratingsCollection = mongo.collection("ratings");
    
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

module.exports.queue = async.queue((task, callback) => {
  async.auto({
    "findOneMatch": (callback) => {
      let query = {
        "$or": [
          { "state": { "$exists": false } }
        ]
      };

      if (task.isFinalize) {
        query["$or"].push({ "state": { "$ne": 1 } });
      } 

      matchesCollection.findOne(
        query,
        { "sort": { "playedAt": 1 } },
        callback
      );
    },
    "aggregateRatings": ["findOneMatch", (results, callback) => {
      let match = results.findOneMatch;

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
                  "player": { "$in": _.flattenDeep([match.winners, match.losers]) }
                }
              ]
            }
          },
          { "$sort": { "createdAt": 1 } },
          {
            "$group": {
              "_id": "$player",
              "points": { "$first": "$points" }
            }
          }
        ],
        {},
        callback
      )
    }],
    "insertManyRatings": ["findOneMatch", "aggregateRatings", (results, callback) => {
      let match = results.findOneMatch,
        ratings = _.reduce(
          results.aggregateRatings,
          (result, value) => {
            result[value._id] = value.points;
            return result;
          },
          {}
        ),
        Row = _.reduce(match.winners, (result, player) => { return result + (ratings[player] || 0) }, 0),
        Rol = _.reduce(match.losers, (result, player) => { return result + (ratings[player] || 0) }, 0),
        K = match.K,
        G = match.G,
        Dw = Rol - Row,
        Dl = Row - Rol,
        Ew = 1.0 / (Math.pow(10, -Dw / task.F) + 1),
        El = 1.0 / (Math.pow(10, -Dl / task.F) + 1),
        Rnw = Row + G * K * (1 - Ew),
        Rnl = Rol + G * K * (0 - El),
        createdAt = Date.now();
      
      let docs = [].concat(createRatings(match.winners, Row, Rol, K, G, task.F, Dw, Dl, Ew, El, Rnw, match._id, createdAt)).concat(createRatings(match.losers, Row, Rol, K, G, task.F, Dw, Dl, Ew, El, Rnl, match._id, createdAt));
      
      console.log(results, docs);

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
    "updateOneMatch": ["insertManyRatings", "findOneMatch", (results, callback) => {
      matchesCollection.updateOne(
        {
          "_id": results.findOneMatch._id
        },
        {
          "$set": { "state": task.isFinalize ? 1 : 0 },
        },
        {
          "w": 1,
          "j": true
        },
        callback
      );
    }],
    "send": ["insertManyRatings", (results, callback) => {
      if (task.socket) {
        task.socket.send(results.insertManyRatings);
      }
      
      callback();
    }]
  }, callback);
}, 1);
