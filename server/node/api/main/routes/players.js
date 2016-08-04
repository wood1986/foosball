"use strict";

let name = __filename.replace(new RegExp(`(^${__dirname.replace("/", "\/")}\/|\.js$)`, "g"), ""),
  router = require("express").Router(),
  collection = require("../../../common/mongo.js")().collection(name),
  middleware = require("../../../common/middleware.js"),
  utils = require("../../../common/utils.js");

router
  .route(`/1.0/${name}`)
  .get(middleware.defaultGet(collection))
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
      (err, player) => {
        if (err) {
          res.status(500).end();
          return;
        }

        if (!player) {
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
