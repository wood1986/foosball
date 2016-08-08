"use strict";

let name = __filename.replace(new RegExp(`(^${__dirname.replace("/", "\/")}\/|\.js$)`, "g"), ""),
  router = require("express").Router(),
  collection = require("../../common/mongo.js")().collection(name),
  middleware = require("../../common/middleware.js"),
  _ = require("lodash"),
  utils = require("../../common/mainUtils.js");

router
  .route(`/1.0/${name}`)
  .get(middleware.defaultGet(collection))
  .post((req, res, next) => {
    let accessToken = req.query.accessToken;

    if (!utils.isAppToken(accessToken)) {
      let err = new Error();
      err.statusCode = 401;
      next(err);
      return;
    }

    let doc = {},
        body = req.body;
    
    let K = body.K;
    if (K) {
      if (_.isNaN(K) || ~~K <= 1) {
        let err = new Error();
        err.statusCode = 400;
        next(err);
        return;
      }
      doc.K = ~~K;
    }
    
    let G = body.G;
    if (G) {
      if (!_.isArray(G) || !G.length) {
        let err = new Error();
        err.statusCode = 400;
        next(err);
        return;
      }

      G = _.chain(G).map(parseFloat).value();

      if (_.findIndex(G, (f) => { return f < 1; } ) > -1) {
        let err = new Error();
        err.statusCode = 400;
        next(err);
        return;
      }

      doc.G = G;
    }
    
    if (!G && !K) {
      let err = new Error();
      err.statusCode = 400;
      next(err);
      return;
    }

    let validity = body.validity
    if (!_.isArray(validity)) {
      let err = new Error();
      err.statusCode = 400;
      next(err);
      return;
    }
    
    validity = _.chain(validity).map(_.ary(parseInt, 1)).take(2).value().sort();
    
    if (validity.length != 2 || _.findIndex(validity, (i) => { return i < 0; }) > -1) {
      let err = new Error();
      err.statusCode = 400;
      next(err);
      return;
    }

    doc.validity = validity;

    doc.createdAt = Date.now();
    
    doc._id = utils.uuid(); 

    collection.insertOne(
      doc,
      {
        "w": 1,
        "j": true
      },
      (err) => {
        if (err) {
          err.statusCode = 500;  
          next(err);
          return;
        }
        
        if (!utils.isProduction()) {
          res.json(doc);
          return;
        }

        res.status(200).end();
        return;
      }
    )
  });

module.exports = router;