"use strict";

let app = require("express")(),
    middleware = require("../common/middleware.js"),
    async = require("async");
    
app.enable("trust proxy");
app.use(require("compression")());
app.use(require("response-time")());
app.get("/", middleware.pong);
app.use(require("body-parser").json());

let server = require("http").Server(app);
server.listen(3000);

async.waterfall([
  (callback) => {
    require("../common/io.js")(server, callback);
  },
  (callback) => {
    require("../common/mongo.js")(callback);
  },
  (callback) => {
    app.use(middleware.parseAccessToken);

    app.use("/", require("./routes/players.js"));
    app.use("/", require("./routes/matches.js"));
    app.use("/", require("./routes/ratings.js"));
    app.use("/", require("./routes/settings.js"));

    app.use(middleware.notFound);
    app.use(middleware.error);

    require("./sockets/ratings.js");

    callback();
  }
]);