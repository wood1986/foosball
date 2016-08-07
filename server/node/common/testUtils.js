let async = require("async"),
  request = require("request"),
  _ = require("lodash"),
  configs = require("../../configs/configs.js");

module.exports.createSettings = (K, G, validity, callback) => {
  let body = {
    K,
    G,
    validity
  };
  
  request(
    {
      "method": "POST",
      "uri": `http://${configs.node.test.host}/1.0/settings`,
      "json": true,
      body
    },
    (err, res, body) => {
      callback(err, body);
    }
  );
};

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
          "uri": `http://${configs.node.test.host}/1.0/players`,
          "json": true,
          body
        },
        (err, res, body) => {
          next(err, body);
        }
      )
    },
    callback
  );
}

module.exports.createMatches = (n, players, settings, callback) => {
  let playedAt = _.times(players.length, () => { return Date.now() - _.random(86400000 * 28) }).sort();
  
  async.times(
    n,
    (m, next) => {
      players = _(players).shuffle().value();

      let singleOrDouble = players.length == 2 ? 1 : _.sample([1, 2]),
          body = {
            "winners": _(players).take(singleOrDouble).map("_id").value(),
            "losers": _(players).takeRight(singleOrDouble).map("_id").value(),
            "score": _.random(1, 5),
            "playedAt": playedAt[m],
            "K": settings._id,
            "G": settings._id
          };

      request(
        {
          "method": "POST",
          "uri": `http://${configs.node.test.host}/1.0/matches`,
          "json": true,
          body,
          "qs": {
            "accessToken": players[0].accessToken
          }
        },
        (err) => {
          next(err);
        }
      );
    },
    callback
  )
}