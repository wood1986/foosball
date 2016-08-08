"use strict";

let name = __filename.replace(new RegExp(`(^${__dirname.replace("/", "\/")}\/|\.js$)`, "g"), ""),
  router = require("express").Router(),
  collection = require("../../common/mongo.js")().collection(name),
  middleware = require("../../common/middleware.js"),
  utils = require("../../common/mainUtils.js");

router
  .route(`/1.0/${name}`)
  .get(middleware.defaultGet(collection))
  .post((req, res, next) => {
    let body = req.body;

    if (!(body && body.displayName && body.email)) {
      let err = new Error();
      err.statusCode = 400;
      next(err);
      return;
    }

    if (!(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(body.email) && body.email.length <= 254)) {
      let err = new Error();
      err.statusCode = 400;
      next(err);
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
      (err) => {
        if (err) {
          err.statusCode = 500;
          next(err);
          return;
        }

        res.json({
          "_id": id,
          "accessToken": utils.obtainAccessToken(id)
        });
      }
    );
  });

module.exports = router;
