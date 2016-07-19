"use strict";

var configs = {
  "node": {
    "password": "Om0X[aDTgWiz92lQ".toString("binary")
  },
  "mongo": {
    "username": "node",
    "password": "bdq46DzNNqVrdsPM",
    "host": "127.0.0.1",
    "database": "foosball"
  }
};

configs.mongo.url = `mongodb://${configs.mongo.username}:${configs.mongo.password}@${configs.mongo.host}/${configs.mongo.database}`;

module.exports = configs;
