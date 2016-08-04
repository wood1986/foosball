"use strict";

let name = __filename.replace(new RegExp(`(^${__dirname.replace("/", "\/")}\/|\.js$)`, "g"), ""),
  router = require("express").Router(),
  collection = require("../../../common/mongo.js")().collection(name),
  middleware = require("../../../common/middleware.js"),
  _ = require("lodash"),
  utils = require("../../../common/utils.js");

router
  .route(`/1.0/${name}`)
  .get(middleware.defaultGet(collection))
  .post((req, res) => {
    let doc = {},
        body = req.body;
    
    let K = body.K;
    if (K) {
      if (_.isNaN(K) || ~~K <= 1) {
        res.status(400).end();
        return;
      }
      doc.K = ~~K;
    }
    
    let G = body.G;
    if (G) {
      if (!_.isArray(G) || !G.length) {
        res.status(400).end();
        return;
      }

      G = _.chain(G).map(parseFloat).value();

      if (_.findIndex(G, (f) => { return f < 1; } ) > -1) {
        res.status(400).end();
        return;
      }

      doc.G = G;
    }

    let validity = body.validity
    if (!_.isArray(validity)) {
      res.status(400).end();
      return;
    }
    
    validity = _.chain(validity).map(_.ary(parseInt, 1)).value().sort();
    
    if (validity.length !== 2 && _.findIndex(validity, (i) => { return i < 0; }) > -1) {
      res.status(400).end();
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
          res.status(500).end();
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