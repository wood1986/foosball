"use strict";

let configs = require("../configs.js");

module.exports = (callback) => {
  if (this.db) {
    return this.db;
  }

  require("mongodb").MongoClient.connect(
    configs.mongo.url,
    (error, db) => {
      if (error) {
        throw error;
      }

      this.db = db;
      callback();
    }
  );
};