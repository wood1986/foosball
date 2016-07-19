"use strict";

let name = __filename.replace(new RegExp(`(^${__dirname.replace("/", "\/")}\/|\.js$)`, "g"), ""),
  router = require("express").Router(), // eslint-disable-line new-cap
  collection = require("../mongo.js")().collection(name),
  async = require("async"),
  utils = require("../utils.js"),
  _ = require("lodash");  // eslint-disable-line id-length

router
  .route(`/1.0/${name}`)
  .get((req, res) => {
    let limit = Math.min(parseInt(req.query.limit) || 16, 256),
      skip = parseInt(req.query.skip) || 0,
      aggregate = req.query.aggregate || "{}"
    
    try {
      aggregate = JSON.parse(aggregate);
    } catch (err) {
      console.log(err);
      res.status(400).end();
      return;
    }
    
    collection
      .aggregate(aggregate)
      .sort({
        "createdAt": -1
      })
      .skip(skip)
      .limit(limit)
      .toArray((err, docs) => {
        if (err) {
          res.status(500).end();
          return
        }

        if (!docs.length) {
          res.status(404).json([]);
          return;
        }

        res.json(docs);
      });
  })
  .post((req, res) => {
    let accessToken = req.query.accessToken;

    if (!req.query.accessToken) {
      res.status(401).end();
      return;
    }

    let body = req.body;

    if (!req.body) {
      res.status(400).end();
      return;
    }

    let winners = (_.isArray(body.winners) ? _.flattenDeep(body.winners) : []).sort(),
      losers = (_.isArray(body.losers) ? _.flattenDeep(body.losers) : []).sort();
    
    if (winners.indexOf(accessToken.id) === -1) {
      res.status(400).end();
      return;
    }

    let players = _
      .chain([winners, losers])
      .flattenDeep()
      .uniq()
      .value();
    
    if (!(players.length === 2 || players.length === 4)) {
      res.status(400).end();
      return;
    }

    let score = parseInt(body.score) || 0;

    if (score < 1) {
      res.status(400).end();
      return;
    }

    let createdAt = Date.now(),
      playedAt = parseInt(body.playedAt) || createdAt;
    
    if ((process.env.NODE_ENV === "production") && (playedAt > createdAt || playedAt < createdAt - 86400000)) {
      res.status(400).end();
      return;
    }

    async.waterfall(
      [
        (callback) => {
          require("../mongo.js")()
            .collection("players")
            .count(
              {
                "_id": {
                  "$in": players
                }
              },
              (err, count) => {
                if (err) {
                  callback(err);
                  return;
                }

                if (count !== players.length) {
                  res.status(400).end();
                  callback(new Error());
                  return;
                }

                callback();
              }
            )
        },
        (callback) => {
          collection.insertOne(
            {
              "_id": utils.uuid(),
              winners,
              losers,
              score,
              playedAt,
              "createdBy": accessToken.id,
              createdAt
            },
            {
              "w": 1,
              "j": true
            },
            callback
          );
        }
      ],
      (err) => {
        if (err) {
          res.status(500).end();
          return;
        }

        res.status(200).end()
      }
    )
  });

module.exports = router;
