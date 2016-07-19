let async = require("async"),
  request = require("request"),
  _ = require("lodash");

exports.apiUrl = "http://localhost:3000/";

module.exports.createPlayers = (n, callback) => {
  async.times(
    n,
    (m, next) => {
      let body = {
        "email": `${Math.random().toString(36).substring(2)}@${Math.random().toString(36).substring(2)}.com`,
        "displayName": Math.random().toString(36).substring(2)
      };

      request(
        {
          "method": "POST",
          "uri": `${this.apiUrl}/1.0/players`,
          "json": true,
          "body": body
        },
        (err, res, body) => {
          next(err || res.statusCode !== 200, body);
        }
      )
    },
    callback
  );
}

module.exports.createMatches = (n, players, callback) => {
  async.times(
    n,
    (m, next) => {
      players = _(players).shuffle().value();

      let singleOrDouble = _.sample([1, 2]);
      
      let body = {
        "winners": _(players).take(singleOrDouble).map("id").value(),
        "losers": _(players).takeRight(singleOrDouble).map("id").value(),
        "score": _.random(1, 5),
        "playedAt": Date.now - _.random(86400000) 
      };

      request(
        {
          "method": "POST",
          "uri": `${this.apiUrl}/1.0/matches`,
          "json": true,
          "body": body,
          "qs": {
            "accessToken": players[0].accessToken
          }
        },
        (err, res, body) => {
          next(err || res.statusCode !== 200, body);
        }
      );
    },
    callback
  )
}