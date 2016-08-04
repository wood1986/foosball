db = db.getSiblingDB(configs.mongo.database);
db.createUser({
  "user": configs.mongo.username,
  "pwd": configs.mongo.password,
  "roles": [ { "role": "readWrite", "db": configs.mongo.database } ]
});
db.players.createIndex({ "email": 1 }, { "unique": true });
db.players.createIndex({ "createdAt": 1 });
db.matches.createIndex({ "playedAt": 1 });
db.matches.createIndex({ "state": -1, "playedAt": 1 });
db.ratings.createIndex({ "player": 1, "createdAt": 1 });
db.settings.createIndex({ "startedAt": 1 });

