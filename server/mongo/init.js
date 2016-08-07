db = db.getSiblingDB(configs.mongo.database);
db.createUser({
  "user": configs.mongo.username,
  "pwd": configs.mongo.password,
  "roles": [ { "role": "readWrite", "db": configs.mongo.database } ]
});
db.players.createIndex({ "email": 1 }, { "unique": true });
db.matches.createIndex({ "playedAt": 1, "state": 1 });
db.ratings.createIndex({ "player": 1, "createdAt": 1, "state": 1 });
db.settings.createIndex({ "validity": 1 });

