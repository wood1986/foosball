"use strict";

let configs = require("../../configs/configs.js");

module.exports = (callback) => {
  if (this.db) {
    if (callback) {
      callback();
      return;
    }
    return this.db;
  }

  require("mongodb").MongoClient.connect(
    configs.mongo.url,
    (error, db) => {
      if (error) {
        throw error;
      }

      this.db = db;
      if (callback) {
        callback();
      }
    }
  );
};