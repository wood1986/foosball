"use strict";

let name = __filename.replace(new RegExp(`(^${__dirname.replace("/", "\/")}\/|\.js$)`, "g"), ""),
  router = require("express").Router(),
  collection = require("../mongo.js")().collection(name),
  utils = require("../utils.js");

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
          return;
        }

        if (!docs.length) {
          res.status(404).json([]);
          return;
        }

        res.json(docs);
      });
  })
  .post((req, res) => {
    let body = req.body;

    if (!(body && body.displayName && body.email)) {
      res.status(400).end();
      return;
    }

    if (!(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(body.email) && body.email.length <= 254)) {
      res.status(400).end();
      return;
    }

    body.displayName = body.displayName.substring(0, 64);

    let id = utils.uuid();

    collection.insertOne(
      {
        "_id": id,
        "email": body.email,
        "displayName": body.displayName,
        "createdAt": Date.now()
      },
      {
        "w": 1,
        "j": true
      },
      (error, result) => {
        if (error) {
          res.status(500).end();
          return;
        }

        if (!result) {
          res.status(500).end();
          return;
        }

        res.json({
          id,
          "accessToken": utils.obtainAccessToken(id)
        });
      }
    );
  });

module.exports = router;
