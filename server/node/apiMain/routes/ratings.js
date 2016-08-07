"use strict";

let name = __filename.replace(new RegExp(`(^${__dirname.replace("/", "\/")}\/|\.js$)`, "g"), ""),
  router = require("express").Router(),
  collection = require("../../common/mongo.js")().collection(name),
  middleware = require("../../common/middleware.js");

router
  .route(`/1.0/${name}`)
  .get(middleware.defaultGet(collection));

module.exports = router;