"use strict";

let name = __filename.replace(new RegExp(`(^${__dirname.replace("/", "\/")}\/|\.js$)`, "g"), ""),
  router = require("express").Router(),
  mongo = require("../../common/mongo.js")(),
  collection = mongo.collection(name),
  async = require("async"),
  utils = require("../../common/mainUtils.js"),
  middleware = require("../../common/middleware.js"),
  elo = require("../../common/elo.js"),
  socket = require("../sockets/ratings.js"),
  _ = require("lodash");

router
  .route(`/1.0/${name}`)
  .get(middleware.defaultGet(collection))
  .post((req, res, next) => {
    let accessToken = req.query.accessToken;

    if (!accessToken) {
      let err = new Error();
      err.statusCode = 401;
      next(err);
      return;
    }

    let body = req.body;

    if (!req.body) {
      let err = new Error();
      err.statusCode = 400;
      next(err);
      return;
    }

    let winners = (_.isArray(body.winners) ? _.flattenDeep(body.winners) : []).sort(),
      losers = (_.isArray(body.losers) ? _.flattenDeep(body.losers) : []).sort();
    
    if (winners.indexOf(accessToken._id) === -1 && !utils.isAppToken(accessToken)) {
      let err = new Error();
      err.statusCode = 400;
      next(err);
      return;
    }
    
    let players = _
      .chain([winners, losers])
      .flattenDeep()
      .pull(utils.appId)
      .uniq()
      .value();
    
    if (!(players.length === 2 || players.length === 4 || players.length === winners.length + losers.length)) {
      let err = new Error();
      err.statusCode = 400;
      next(err);
      return;
    }

    let score = parseInt(body.score) || 0;

    if (score < 1) {
      let err = new Error();
      err.statusCode = 400;
      next(err);
      return;
    }

    let now = Date.now(),
      playedAt = parseInt(body.playedAt) || now;
    
    if ((utils.isProduction()) && (playedAt > now || playedAt < now - 86400000)) {
      let err = new Error();
      err.statusCode = 400;
      next(err);
      return;
    }

    if (!body.K) {
      let err = new Error();
      err.statusCode = 400;
      next(err);
      return;
    }

    if (!body.G) {
      let err = new Error();
      err.statusCode = 400;
      next(err);
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
              err.statusCode = 500;
              callback(err);
              return;
            }

            if (result[0].count !== players.length) {
              let err = new Error();
              err.statusCode = 400;
              next(err);
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
              err.statusCode = 500;
              callback(err);
              return;
            }

            if (!result) {
              let err = new Error();
              err.statusCode = 400;
              next(err);
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
              err.statusCode = 500;
              callback(err);
              return;
            }

            if (!result || !result.G[score]) {
              let err = new Error();
              err.statusCode = 400;
              next(err);
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
            "createdBy": accessToken._id,
            "createdAt": now,
            "playedAt": now
          },
          {
            "w": 1,
            "j": true
          },
          (err) => {
            if (err) {
              err.statusCode = 500;
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
    }, next);
  });

module.exports = router;
