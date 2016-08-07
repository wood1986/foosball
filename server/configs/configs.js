"use strict";

var configs = {
  "node": {
    "main": {
      "password": "Om0X[aDTgWiz92lQ".toString("binary")
    },
    "test": {
      "protocol": "http",
      "host": "127.0.0.1:3000"
    }
  },
  "mongo": {
    "username": "node",
    "password": "bdq46DzNNqVrdsPM",
    "host": "mongo",
    "database": "foosball"
  }
};

configs.mongo.url = `mongodb://${configs.mongo.username}:${configs.mongo.password}@${configs.mongo.host}/${configs.mongo.database}`;

module.exports = configs;
