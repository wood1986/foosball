db = db.getSiblingDB(configs.mongo.database);
db.createUser({
  "user": configs.mongo.username,
  "pwd": configs.mongo.password,
  "roles": [ { "role": "readWrite", "db": configs.mongo.database } ]
});
db.players.createIndex({ "email": 1 }, { "unique": true });
db.players.createIndex({ "createdAt": 1 });
db.matches.createIndex({ "winners": 1 });
db.matches.createIndex({ "losers": 1 });
db.matches.createIndex({ "createdAt": 1 });
db.matches.createIndex({ "playedAt": 1 });
