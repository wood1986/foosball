"use strict";

let name = __filename.replace(new RegExp(`(^${__dirname.replace("/", "\/")}\/|\.js$)`, "g"), ""),
  router = require("express").Router(), // eslint-disable-line new-cap
  mongo = require("../../common/mongo.js")(),
  collection = mongo.collection(name),
  async = require("async"),
  utils = require("../../common/utils.js"),
  middleware = require("../../common/middleware.js"),
  elo = require("../../common/elo.js"),
  socket = require("../sockets/ratings.js"),
  _ = require("lodash");  // eslint-disable-line id-length

router
  .route(`/1.0/${name}`)
  .get(middleware.defaultGet(collection))
  .post((req, res, next) => {
    let accessToken = req.query.accessToken;

    if (!accessToken) {
      res.status(401);
      next(new Error());
      return;
    }

    let body = req.body;

    if (!req.body) {
      res.status(400);
      next(new Error());
      return;
    }

    let winners = (_.isArray(body.winners) ? _.flattenDeep(body.winners) : []).sort(),
      losers = (_.isArray(body.losers) ? _.flattenDeep(body.losers) : []).sort();
    
    if (winners.indexOf(accessToken.id) === -1 && !utils.isAppToken(accessToken)) {
      res.status(400);
      next(new Error());
      return;
    }
    
    let players = _
      .chain([winners, losers])
      .flattenDeep()
      .pull(utils.appId)
      .uniq()
      .value();
    
    if (!(players.length === 2 || players.length === 4 || players.length === winners.length + losers.length)) {
      res.status(400);
      next(new Error());
      return;
    }

    let score = parseInt(body.score) || 0;

    if (score < 1) {
      res.status(400);
      next(new Error());
      return;
    }

    let now = Date.now(),
      playedAt = parseInt(body.playedAt) || now;
    
    if ((utils.isProduction()) && (playedAt > now || playedAt < now - 86400000)) {
      res.status(400);
      next(new Error());
      return;
    }

    if (!body.K) {
      res.status(400);
      next(new Error());
      return;
    }

    if (!body.G) {
      res.status(400);
      next(new Error());
      return;
    }

    async.auto({
      "players": (callback) => {
        mongo
          .collection("players")
          .aggregate([
            { "$match": { "_id": { "$in": players } } },
            { "$group": { "_id": null, "count": { "$sum": 1 } } }
          ],
          {},
          (err, result) => {
            if (err) {
              callback(err);
              return;
            }

            if (result[0].count !== players.length) {
              res.status(400);
              callback(new Error(""));
              return;
            }

            callback();
          });
      },
      "K": (callback) => {
        mongo
          .collection("settings")
          .findOne({
            "$and": [
              { "_id": body.K },
              { "validity": { "$gte": now } },
              { "validity": { "$lte": now } }
            ]
          },
          (err, result) => {
            if (err) {
              callback(err);
              return;
            }

            if (!result) {
              res.status(400);
              callback(new Error(""));
              return;
            }

            callback(err, result);
          });
      },
      "G": (callback) => {
        mongo
          .collection("settings")
          .findOne({
            "$and": [
              { "_id": body.G },
              { "validity": { "$gte": now } },
              { "validity": { "$lte": now } }
            ]
          },
          (err, result) => {
            if (err) {
              callback(err);
              return;
            }

            if (!result || !result.G[score]) {
              res.status(400);
              callback(new Error(""));
              return;
            }

            callback(err, result);
          });
      },
      "match": ["players", "K", "G", (results, callback) => {
        collection.insertOne(
          {
            "_id": utils.uuid(),
            winners,
            losers,
            score,
            "K": results.K.K,
            "K_id": results.K._id,
            "G": results.G.G[score],
            "G_id": results.G._id,
            "createdBy": accessToken.id,
            "createdAt": now,
            "playedAt": now
          },
          {
            "w": 1,
            "j": true
          },
          (err) => {
            if (err) {
              callback(err);
              return;
            }

            res.status(200).end();
            callback();
          }
        )
      }],
      "elo": ["match", (results, callback) => {
        elo.queue.push({ F: 400, isFinalized: false, socket });
        callback();
      }]
    }, (err) => {
      if (err) {
        next(err);
      }

      return;
    });
  });

module.exports = router;
